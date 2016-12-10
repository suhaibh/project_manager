function getURLParameter(sParam) {
	var sPageURL = window.location.search.substring(1);
	var sURLVariables = sPageURL.split('&');

	for (var i = 0; i < sURLVariables.length; i++)
		{var sParameterName = sURLVariables[i].split('=');
		if (sParameterName[0] == sParam) {
			return sParameterName[1];
		}
	}
};

$(document).ready(function(){
	var show_error, stripeResponseHandler, submitHandler;
// Check params from URL

// Stop regular submission of form so Stripe can send a token to use
	submitHandler = function(event){
		var $form = $(event.target);
		
		$form.find("input[type=submit]").prop("disabled", true);
		
		if(Stripe){
			Stripe.card.createToken($form, stripeResponseHandler)
		}
		else {
			show_error("Credit processing failed, please refresh")
		}
		return false;
	};

// Initiate event listener on submission of any form that has the class='cc-form'
	$('.cc_form').on("submit", submitHandler);

// Handle the event of the Plan dropdown changing
	var handlePlanChange = function(plan_type, form){
		var $form = $(form);
		if (plan_type == undefined) {
			plan_type = $("#tenant_plan :selected").val();
		}

		if (plan_type === "premium") {
			$('[data-stripe]').prop("required", true);
			$form.off('submit');
			$form.on('submit', submitHandler);
			$('[data-stripe').show();
		}
		
		else {
			$('[data-stripe]').hide();
			$form.off('submit');
			$('[data-stripe]').removeProp('required');
		}
	};
	

// Set up the Plan change event listener for #tenant_plan id in forms with class='cc-form'
	$("#tenant_plan").on("change", function(event){
		handlePlanChange($('#tenant_plan').val(), ".cc_form");
	});
	
// Call Plan change handler so the Plan is set correctly in the dropdown when the page loads
	handlePlanChange(getURLParameter('plan'), ".cc_form");

// Add the token sent back from Stripe and remove all the credit card information so it doesn't touch the database
	stripeResponseHandler = function(status, response){
		var $form = $('.cc_form');

		if (response.error) {
			console.log(response.error.message);
			show_error(response.error.message);
			$form.find("input[type=subit]").prop("disabled", false);
		} else {
			var token = response.id;
			$form.append($('<input type="hidden" name="payment[token]">').val(token));
			$("[data-stripe=number]").remove();
			$("[data-stripe=cvv]").remove();
			$("[data-stripe=exp-month]").remove();
			$("[data-stripe=exp-year]").remove();
			$("[data-stripe=label]").remove();
			$form.get(0).submit();
		}
	};

// Show errors when Stripe returns an error
	show_error = function(message){
		if($("#flash-messages").size() < 1){
			$('div.container.main div:first').prepend("<div id='flash-messages'></div>")
		}
		$("#flash-messages").html('<div class="alert alert-warning">' + message + '</div>');
		return false;
	};

});
