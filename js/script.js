/**
 * Sets up handlers for inputs
 */
(function () {
	var jiraInput = document.getElementById("j");
	var markdownInput = document.getElementById("m");

	var jiraCallback = function () {
	  var markdown = J2M.toM(jiraInput.value);
	  markdownInput.value = markdown;
	};

	var markdownCallback = function () {
	  var jira = J2M.toJ(markdownInput.value);
	  jiraInput.value = jira;
	};

	jiraInput.addEventListener('keyup', jiraCallback);
	jiraInput.addEventListener('blur', jiraCallback);

	markdownInput.addEventListener('keyup', markdownCallback);
	markdownInput.addEventListener('blur', markdownCallback);
})();
