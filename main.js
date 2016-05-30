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

    $('.slider').slick({
        dots: true,
        autoplay: true,
        autoplayspeed: 4000,
        lazyLoad: 'ondemand',
        speed: 700,
        easing: 'ease-in',
    });
});




