// Read URL parameters
$.urlParam = function(name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.search);
    return (results !== null) ? decodeURI(results[1]) || 0 : false;
}
// Ajax errors handler
$.ajaxError = function(jqxhr, textStatus, error) {
    var err = textStatus + ", " + error;
    console.log("Request Failed: " + err);
}

// DocumentReady
$(function() {

    //// init
    $('.loadinggif').hide();
    $(".filter").val("");
    // if about undefined
    if ($.urlParam('about') == 0)
        $('#aboutbox').hide();

    //// ajax
    // fetching initial diets
    $.getJSON("../api/diets/")
    .done(function(result) {
        // iterating through results
        $.each(result, function(i, field) {
            // populating tags
            $("#tags").append('<option value="' + field.Title + '">' + field.Title + ' (' + field.c + ')</option>');
        });
    })
    .fail($.ajaxError);

    // tags select listener
    $("#tags").on('change', function() {
        // clearing and showing gifs
        $("#results, #diets").empty();
        $('#resultsgif, #dietsgif').show();
        // creating JSON object from select
        var diets = $('#tags').val();
        // showing selection to user
        $("#summary").html(diets.join(", "));
        var postBody = 'body=' + JSON.stringify({ diets });

        // recipes
        $.post("../api/recipes/", postBody, function(result) {
            $('#resultsgif').hide();
            // labeling from result length
            if (result.length == 0) {
                $("#results").append('<p class="m-1">Sin resultados</p>');
            } else {
                $("#resultshead").html(`Recetas <small>(${result.length})</small>`);
            }
            //iterating through results
            $.each(result, function(i, field) {
                // populating results
                $htmlblock = `
                <div class="card">
                    <div class="row no-gutters">
                    <div style="max-width: 140px;">
                        <img src="https://bigoven-res.cloudinary.com/image/upload/t_recipe-256/${field.PhotoUrl}" class="card-img">
                    </div>
                    <div class="col">
                            <div class="card-body">
                                <a href="https://www.bigoven.com/recipe/r/${field.Id}" target="_blank">
                                    <h5 class="mb-1">${field.Title}</h5>
                                </a>
                                <p class="mb-1"><i class="fa fa-hand-o-right" aria-hidden="true"></i> ${field.PrimaryIngredient}</p>
                                <p class="mb-1"><i class="fa fa-heartbeat" aria-hidden="true"></i> ${field.FavoriteCount} | <i class="fa fa-star" aria-hidden="true"></i> ${field.StarRating} <small>(${field.ReviewCount})</small> | <i class="fa fa-thermometer-half" aria-hidden="true"></i> ${field.TotalCalories} Cal. | <i class="fa fa-users" aria-hidden="true"></i> ${field.Servings}</p>
                                <small>${field.Ingredients}</small>
                            </div>
                    </div>
                    </div>
                </div>`;
                $("#results").append($htmlblock);
                // break loop after n iterations
                if (i > 50) {
                    return false;
                }
            });
        }, 'json')
        .fail($.ajaxError);
    });

    //// filters
    $("#filterleft").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        $("#tags option").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });

});