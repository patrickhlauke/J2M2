/**
 * Sets up handlers for inputs
 */
(function () {
	var jiraInput = document.getElementById("j");
	var markdownInput = document.getElementById("m");
	var markdownImageHandling = document.getElementById("imgconv");

	var jiraCallback = function () {
	  var markdown = J2M.toM(jiraInput.value);
	  markdownInput.value = markdown;
	};

	var markdownCallback = function () {
	  var jira = J2M.toJ(markdownInput.value);
	  if (markdownImageHandling.checked) {
		  jira = J2M.imgJ(jira);
	  }
	  jiraInput.value = jira;
	};

	jiraInput.addEventListener('keyup', jiraCallback);
	jiraInput.addEventListener('blur', jiraCallback);

	markdownInput.addEventListener('keyup', markdownCallback);
	markdownInput.addEventListener('blur', markdownCallback);
	markdownImageHandling.addEventListener('change', markdownCallback);
})();
