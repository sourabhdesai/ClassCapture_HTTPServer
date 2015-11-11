# ClassCapture
A platform whereby students participate in a crowdsourced effort to aggregate quality lecture video content via mobile devices.

## Why SailsJS
This is a [Sails](http://sailsjs.org) application.

There are a whole host of reasons for choosing SailsJS

- [API Model Scaffolding](https://youtu.be/GK-tFvpIR7c?t=1m35s)
- [Real time Pub Sub to API backend](https://youtu.be/GK-tFvpIR7c?t=5m20s) via [Socket.IO](http://socket.io/)
- Built on top of solid, mature middleware like [Express](http://expressjs.com/) and [Socket.IO](http://socket.io/)
- Promotes modularized project structure with Models/Controllers/Services
- Wraps Model interaction with the *database agnostic* ORM [Waterline](https://github.com/balderdashy/waterline)
	
## Schemas
All database models are stored in the `api/models/` directory.
The API to interact with these Schemas are scaffolded by the SailsJS framework.
The blueprint of the scaffolded API are detailed [here](http://sailsjs.org/documentation/reference/blueprint-api).

### Recording
Look at `api/models/Recording.js` for a concrete, up to date representation of this model. A Recording contains basic metadata regarding a given user uploaded video.

- Attributes
	- `startTime`
		- The timestamp for the starting time of the related recording file
		- Type: `Date`
		- Required
		- Must be chronologically before `endTime`
	- `endTime`
		- The timestamp for the ending time of the related recording file
		- Type: `Date`
		- Required
		- Must be chronologically after `startTime`
	- `filename`
		- The filename for the video resource that this Recording object holds metadata for
		- Type: `String`
		- Unique
	- `section`
		- The section that this recording was taken for
		- Type: `Section`
		- Required
		
### Course
Look at `api/models/Course.js` for a concrete, up to date representation of this model. A Course object contains basic metadata for a Course that contains sections.

- Attributes
	- `department`
		- Department that the course is under. For example, *CS 225* is under the *CS* department.
		- Type: `String`
		- Required
		- Must consist of only uppercase alphabet characters and must have a minimum length of 2
	- `number`
		- The course number. For example, *CS 225* has the course number *225*
		- Type: `integer`
		- Required
	- `sections`
		- The sections under this course. This would things like Lecture, Discussion, or Lab sections for a particular course.
		- Type: Collection of Sections (AKA `Section Array`)
		- This can just be an array of Section IDs like `[1,3,67]`
	
### Section
Look at `api/models/Section.js` for a concrete, up to date representation of this model. A Section contains basic metadqta for a Section that is part of a course.

- Attributes
	- `startTime`
		- Starting time for the section. The date for this value is scaled back to epoch *(Jan 1st, 1970)*, however, the time of the value is preserved. For example: 1 PM on November 5th, 2015 is scaled back to 1 PM on January 1st, 1990.
		- Type: `Datetime`
		- Required
	- `endTime`
		- Ending time for the section. The data for this value is also scaled back to epoch, like the `startTime` field.
		- Type: `Datetime`
		- Required
	- `name`
		- The name for the section. For example, Lecture sections are typically named somthing like *AL1*.
		- Type: `String`
		- Required
		- Must be at least 2 characters long
	- `course`
		- The course object that this section falls under.
		- Type: `Course`
		- Required
		- This can be specified with just the ID of the Course object.
		
## API Docs
Here's some basic info on how to interact with the API. This is all just from the API scaffolding that is provided by the SailsJS framework ([they have good documentation on this as well](http://sailsjs.org/documentation/reference/blueprint-api)).

### Basic Object manipulation
- `/<model>/`
	- `GET`
		- Responds with a list of all objects of the model type in the form of a JSON array
	- `POST`
		- Creates a new object within the Model schema
		- Request body must contain JSON representation of the object you want to create. All `required` fields must be in this JSON object
- `/<model>/<id>`
	- `GET`
		- Responds with the object that has the specified id.
	- `PUT`
		- Used to edit the object with the specified id.
		- Request body must contain JSON object with fields that contain the new values that you want to update the object with. For example, if I wanted to update the startTime for a `Recording` object with the ID `3`, I would send a put to `/recording/3` and would put the following JSON in the request body: `{ "startTime": <new date value here> }`
	- `DELETE`
		- Delete the object with the specified ID.
		
### Complex Queries
You can also do complex queries with the API. The [Sails JS Docs on this topic](http://sailsjs.org/documentation/reference/blueprint-api/find-where) give a good overview on how to do this.