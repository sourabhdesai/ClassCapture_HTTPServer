var request = require('supertest');
var chai    = require("chai");
var Chance  = require('chance');
var _       = require('sails/node_modules/lodash');

var chance = new Chance();
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();

const NUM_COURSES = 1;

function testSuccessCreateCourse(dept, num, semester, year) {
	const MOCK_DEVICE_ID = "TESTTEST$$TESTTEST";
	it(`Should create a Course Entry called "${dept} ${num}, ${semester} ${year}"`, done => {
		request(sails.hooks.http.app)
			.post('/course/')
			.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
			.send({
				"department": dept,
				"number": num,
				"year": year,
				"semester": semester
			})
			.expect(res => {
				var courseBody = res.body;
				courseBody.should.have.property('department');
				courseBody.department.should.equal(dept);
				courseBody.should.have.property('number');
				courseBody.number.should.equal(num);
				courseBody.should.have.property('id');
				courseBody.should.have.property('year');
				courseBody.year.should.equal(year);
				courseBody.should.have.property('semester');
				courseBody.semester.should.equal(semester);

				// Upon creation, the returned object doesn't have the sections property
				// Manually add it here so it can be referenced in future tests
			 	courseBody.sections = [];
			})
			.expect(201, done);
	});
}
// Invalid department causes an 'E_VALIDATION' error, which is a 400 error
function testInvalidDeptCreateCourse(dept, num, semester, year) {
	const MOCK_DEVICE_ID = "TESTTEST$$TESTTEST";
	it(`Should NOT create a Course Entry called "${dept} ${num}, ${semester} ${year}"`, done => {
		request(sails.hooks.http.app)
			.post('/course/')
			.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
			.send({
				"department": dept,
				"number": num,
				"year": year,
				"semester": semester
			})
			.expect(res => {
				res.body.error.should.equal('E_VALIDATION');
				res.body.status.should.equal(400);;
			})
			.expect(400, done)
	});
}
// Invalid section causes an 'E_UNKNOWN' error, which is a 500 error
function testInvalidSectionCreateCourse(dept, num, semester, year) {
	const MOCK_DEVICE_ID = "TESTTEST$$TESTTEST";
	it(`Should NOT create a Course Entry called "${dept} ${num}, ${semester} ${year}"`, done => {
		request(sails.hooks.http.app)
			.post('/course/')
			.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
			.send({
				"department": dept,
				"number": num,
				"year": year,
				"semester": semester
			})
			.expect(res => {
				res.body.error.should.equal('E_UNKNOWN');
				res.body.status.should.equal(500);;
			})
			.expect(500, done)
	});
}

describe(`Create ${NUM_COURSES} Course Entries`, () => {
	// Make sure that you've added a DeviceID to each request to pass the Blacklisting policy

	var courseDept = "CS";
	var courseNum = 225;
	var semester = "fall";
	var year = 2015;
	testSuccessCreateCourse(courseDept, courseNum, semester, year);

	courseDept = "CS";
	courseNum = 410;
	semester = "spring"
	testSuccessCreateCourse(courseDept, courseNum, semester, year);

	// CS410 is only offered in the spring, so fall should fail
	semester = "fall";
	// Actually causes the 500 (server error) response to be received in the terminal. Not sure how to surpress that, but test still passes. 
	testInvalidSectionCreateCourse(courseDept, courseNum, semester, year);

	// Test invalid department
	courseDept = "xyz";
	testInvalidDeptCreateCourse(courseDept, courseNum, semester, year);
});
