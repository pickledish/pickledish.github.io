$(document).ready(function() {

	$('.content').hide();
	$('#c1').show();

    $("#one").click(function() {
        $('.content').hide();
        $('#c1').show();
    });

    $("#two").click(function() {
        $('.content').hide();
        $('#c2').show();
    });

    $("#three").click(function() {
        $('.content').hide();
        $('#c3').show();
    });

    $("#four").click(function() {
        $('.content').hide();
        $('#c4').show();
    });

    $("#five").click(function() {
        $('.content').hide();
        $('#c5').show();
    });

    $("#six").click(function() {
        $('.content').hide();
        $('#c6').show();
    });

    $('#slider').unslider({

        autoplay: true,
        delay: 5000,
        arrows: {prev: '<a class="unslider-arrow prev"> &#10094; </a>', next: '<a class="unslider-arrow next"> &#10095; </a>',}

    });

    $('.unslider-nav').hide();

});




