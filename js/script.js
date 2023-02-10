/**
 * Sets up handlers for inputs
 */
(function () {
	var jiraInput = document.getElementById("j");
	var markdownInput = document.getElementById("m");
	var imageOptionSelector = 'input[name="imgconvoption"]:checked';

	var markdownCallback = function () {
		markdownImageHandling = document.querySelector(imageOptionSelector).value;
	  var jira = J2M.toJ(markdownInput.value);
		switch (markdownImageHandling) {
			case '1':
			  jira = J2M.imgJthumb(jira);
				break;
			case '2':
			  jira = J2M.imgJcaption(jira);
				break;
			case '3':
			  jira = J2M.imgJreplace(jira);
				break;
			default:
	  }
	  jiraInput.value = jira;
	};

	markdownInput.addEventListener('keyup', markdownCallback);
	markdownInput.addEventListener('blur', markdownCallback);
	document.getElementById('imgconv').addEventListener('change', markdownCallback);

	markdownInput.addEventListener('focus', function() { this.select(); });
	jiraInput.addEventListener('focus', function() { this.select(); });

	// run it first time on load
	markdownCallback();
})();