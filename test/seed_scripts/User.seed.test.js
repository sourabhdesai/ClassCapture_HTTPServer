var request = require('supertest');
var chai    = require("chai");
var Chance  = require('chance');
var _       = require('sails/node_modules/lodash');
var Promise = require('bluebird');

var chance = new Chance();
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();

const NUM_USERS = 2;

const MOCK_DEVICE_ID = "TESTTEST$$TESTTEST";

var sections = [];
var users = [];

function range(start, end) {
	if (_.isUndefined(end)) {
		end = start;
		start = 0;
	}

	var increment = start < end ? 1 : -1; 

	var arr = [];
	while (start < end) {
		arr.push(start);
		start += increment;
	}

	return arr;
}

describe(`Should create ${NUM_USERS} users in the DB`, () => {
	before('Retrieve Section Data', done => {
		request(sails.hooks.http.app)
			.get('/section/')
			.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
			.expect(res => {
				sections = res.body;
				sections.length.should.be.above(0);
			})
			.expect(200, done);
	});

	it(`Should create all ${NUM_USERS} users`, done => {
		async.map(range(NUM_USERS), (idx, cb) => {
			var name = chance.name().split(' ');
			var user = {
				email: chance.email({
					domain: chance.pick(UserService.VALID_EMAIL_DOMAINS) // pick rand valid email domain
				}),
				password: chance.word({length: 6}),
				firstName: name[0], // get first name only
				lastName: name[1],
				sections: _.pluck(sections, 'id')
			};

			var resUser = null;

			request(sails.hooks.http.app)
				.post('/user/')
				.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
				.send(user)
				.expect(res => {
					resUser = res.body;
					resUser.should.have.property('email');
					resUser.email.should.equal(user.email);
					resUser.should.not.have.property('password');
					resUser.should.have.property('firstName');
					resUser.firstName.should.equal(user.firstName);
					resUser.should.have.property('lastName');
					resUser.lastName.should.equal(user.lastName);
				})
				.expect(201, err => {
					if (err) {
						cb(err);
					} else {
						cb(null, resUser);
					}
				});
		}, (err, createdUsers) => {
			if (err) {
				done(err);
				return;
			}

			users = createdUsers;
			done();
		});
	});

	function getRecordingsForSection(section, cb) {
		var sectionID = _.isNumber(section) ? section : section.id;
		var recordings = [];
		request(sails.hooks.http.app)
			.get(`/recording?section=${sectionID}`)
			.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
			.expect(res => {
				recordings = res.body;
				recordings.length.should.be.above(0);
			})
			.expect(200, err => cb(err, recordings));
	}

	it(`Should make a comment for each recording for each user`, done => {
		async.map(sections, getRecordingsForSection, (err, recordings) => {
			if (err) {
				return done(err);
			}

			recordings = _.flatten(recordings);

			async.forEach(recordings, (recording, cb) => {
				var start = new Date(recording.startTime).getTime();
				var end = new Date(recording.endTime).getTime();

				var idx = 0;
				async.forEach(users, (user, commentCb) => {
					var time = start + ((end-start) * ((idx++) / users.length));
					request(sails.hooks.http.app)
						.post('/comment/')
						.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
						.send({
							content: chance.sentence(),
							time: new Date(time),
							poster: user.id,
							recording: recording.id
						})
						.expect(res => {
							var comment = res.body;
							comment.should.have.property('content');
							comment.should.have.property('time');
							time.should.equal(new Date(comment.time).getTime());
							comment.should.have.property('poster');
							comment.should.have.property('recording');
						})
						.expect(201, err => {
							commentCb(err);
						});
				}, cb);
			}, done);
		});
	});

});