// From https://github.com/CloudUnder/lambda-edge-nice-urls/
const regexSuffixless = /\/[^/.]+$/; // e.g. "/some/page" but not "/", "/some/" or "/some.jpg"
const regexTrailingSlash = /.+\/$/; // e.g. "/some/" or "/some/page/" but not root "/"

// https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-event-structure.html
exports.handler = function (event, context, callback) {
	const { request } = event.Records[0].cf;
	const { uri } = request;

	// Append ".html" to origin request
	if (uri.match(regexSuffixless)) {
		request.uri = uri + ".html";
		callback(null, request);
		return;
	}

	// Append "index.html" to origin request
	if (uri.match(regexTrailingSlash)) {
		request.uri = uri + "index.html";
		callback(null, request);
		return;
	}

	// If nothing matches, return request unchanged
	callback(null, request);
}
