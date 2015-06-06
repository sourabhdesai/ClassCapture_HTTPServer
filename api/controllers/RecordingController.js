/**
 * RecordingController
 *
 * @description :: Server-side logic for managing recordings
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var path = require("path");
var fs   = require('fs');

var MAX_FILE_SIZE = 500e6; // in bytes. 500 MB
var VIDEOS_DIR = './assets/videos'; // directories to store videos in

// get extension for a given filename. Returns null if doesn't have an extension
function getFileExtension(filename) {
	var extensionIdx = filename.lastIndexOf(".");

	if (extensionIdx <= 0) {
		return null;
	}

	var extension = filename.substring(extensionIdx + 1);
	
	return extension;
}

module.exports = {
	/**
	 * Handles all POST requests to /postVideo/:videoname
	 * Request header should contain key-value pair of 'video': <video content>
	 * Video content from header will be stored in ./assets/videos/{videoname}
	 */
	postVideo: function (req, res) {
		var videoName = req.param('videoname');

		// File will be in header key 'video'
		req.file("video").upload({
			"dirname": path.resolve(VIDEOS_DIR),
			"saveAs": videoName,
			"maxBytes": MAX_FILE_SIZE // file upload limit
		}, function (err, uploadedFiles) {
			if (err) {
				return res.negotiate(err);
			}

			/**
			 * Example of uploadedFile (element of uploadedFiles array):
			 * {
			 * 		fd: "/Users/sourabhdesai/Documents/Node Projects/ClassCapture/assets/videos/jmarr_dashboard.mp4",
			 * 		size: 1387084,
			 * 		type: "video/mp4",
			 * 		filename: "Johnny Marr plays Dashboard by Modest Mouse.mp4",
			 * 		status: "bufferingOrWriting",
			 * 		field: "video"
			 * }
			 */

			var uploadedFile = uploadedFiles[0];

			var fileExtension = getFileExtension(uploadedFile.filename);

			// Check that the file is in fact an mp4 video file
			if (uploadedFile.type === 'video/mp4' || fileExtension === 'mp4') {
				// On success, will just display the uploadedFile's metadata
				res.json({
					"videoname": videoName,
					"size": uploadedFile.size, // In bytes
					"type": uploadedFile.type
				});
			} else {
				// If not an mp4, respond with a 400 (Bad Request) and delete the saved video file
				res.badRequest("Server only accepts mp4 format video files. Given file extension: " + fileExtension)

				// Delete the saved video file ... uploadedFile.fd is a string of the filepath for the saved file.
				fs.unlink(uploadedFile.fd, function (err) {
					if (err)
						sails.log(err);
				});
			}
		});
	},

	/**
	 * Handles all GET requests to /getVideo/:videoname
	 * Video to send out is in :videoname URL parameter.
	 */
	getVideo: function (req, res) {
		var videoName = req.param("videoname");

		var opts = {
			"root": "./assets/videos"
		};

		// Internally takes care of setting Content-Type
		res.sendfile(videoName, opts, function (err) {
			if (err) {
				res.negotiate(err);
			}
		});
	}
};
