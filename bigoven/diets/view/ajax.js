// global
var alerts = new Set();

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

// Recipes Handler
$.getRecipes = function() {
    // clearing and showing gifs
    $("#results, #diets").empty();
    $('#resultsgif, #dietsgif').show();

    /// creating JSON object from selections
    // diets
    var diets = $('#tags').val();

    // primary ingredients
    var pis = [];
    $(".piswitch input:checked").each(function(index, obj) {
        var pi = obj.id.replace("pi_", "");
        pis.push(pi);
    });

    var postBody = 'body=' + JSON.stringify({ diets, pis });

    // recipes
    $.post("/bigoven/api/recipes/", postBody, function(result) {
        $('#resultsgif').hide();
        // labeling from result length
        if (result.length == 0) {
            $("#results").append('<p class="m-1">Sin resultados</p>');
        } else {
            $("#resultshead").html(`Recetas (${result.length})`);
        }

        // alert or hide?
        var hide = $('#crhide').is(':checked');

        //iterating through results
        $.each(result, function(i, field) {
            // initial vars
            var alertList = "";
            var bodytheme = "";
            // reading recipe' set of ingredients
            var Ingredients = new Set(field.Ingredients.split(", "));
            // calculating intersection with alerts
            var intersect = new Set([...Ingredients].filter(i => alerts.has(i)));
            if (intersect.size > 0) {
                if (hide) return; // like "continue"
                alertList = ", <b>" + Array.from(intersect).join(", ") + "</b>";
                bodytheme = "bg-danger text-white";
            }
            intersect.forEach(function(value, key, set) {
                console.log(field.Title + ": " + value);
            });
            // populating results
            htmlblock = `
            <div style="width: 256px;">
              <div class="card">
                <a href="https://www.bigoven.com/recipe/r/${field.Id}" target="_blank"><img style="height: auto;" src="https://bigoven-res.cloudinary.com/image/upload/t_recipe-256/${field.PhotoUrl}" classs="card-img" /></a>
                <div class="card-body ${bodytheme}">
                  <h5 class="card-title">${field.Title}</h5>
                  <h6 class="card-subtitle"><i class="fa fa-hand-o-right" aria-hidden="true"></i> ${field.PrimaryIngredient}${alertList}</h6>
                </div>
                <div class="card-footer text-muted">
                <i class="fa fa-heartbeat" aria-hidden="true"></i> ${field.FavoriteCount} | <i class="fa fa-star" aria-hidden="true"></i> ${field.StarRating} | <i class="fa fa-thermometer-half" aria-hidden="true"></i> ${field.TotalCalories} Cal. | <i class="fa fa-users" aria-hidden="true"></i> ${field.Servings}
                </div>
              </div>
            </div>`;
            $("#results").append(htmlblock);
            // break loop after n iterations
            if (i > 100) {
                return false;
            }
        });
    }, 'json')
    .fail($.ajaxError);
}

// Alerts handler
$.refreshAlerts = function() {
    // clearing list
    $("#alerts").empty();
    alerts.forEach(function(value, key, set) {
        // populating list
        $("#alerts").append('<li class="list-group-item d-flex justify-content-between align-items-center py-1 pl-3 pr-2">' + value + '<span class="badge badge-pill"><button type="button" id="ingr_' + value + '" class="btn btn-danger btn-sm deletebtn">X</button></span></li>');
    });
    // fetch results
    $.getRecipes();
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
    $.getJSON("/bigoven/api/diets/")
    .done(function(result) {
        // iterating through results
        $.each(result, function(i, field) {
            // populating tags
            $("#tags").append('<option value="' + field.Title + '">' + field.Title + ' (' + field.c + ')</option>');
        });
    })
    .fail($.ajaxError);

    // primary ingredients
    $.getJSON("/bigoven/api/ingredients/?primary=1")
    .done(function(result) {
        // iterating through results
        $.each(result, function(i, field) {
            // populating controls
            $("#pingredients").append('<div class="custom-control custom-switch"><input type="checkbox" class="custom-control-input" id="pi_' + field.IdT + '" checked=""><label class="custom-control-label" for="pi_' + field.IdT + '">' + field.IdT + '</label></div>');
        });
    })
    .fail($.ajaxError);

    // other ingredients
    $.getJSON("/bigoven/api/ingredients/")
    .done(function(result) {
        // iterating through results
        $.each(result, function(i, field) {
            // populating controls
            $("#ingredients").append('<option value="' + field.IdT + '">' + field.IdT + '</option>');
        });
    })
    .fail($.ajaxError);

    // tags select listener
    $("#tags").on('change', $.getRecipes);
    // primary ingredient switches listener
    $(document).on('click', '.piswitch input', $.getRecipes);
    // alert mode listener
    $(".cradio").on('change', $.getRecipes);

    // alerts select listener
    $("#ingredientsbtn").click(function() {
        // reading input
        var ingredient = $("#ingredient").val();
        if (ingredient.length > 0) {
            alerts.add(ingredient);
            // clearing input
            $("#ingredient").val("");
            // refreshing view
            $.refreshAlerts();
        }
    });

    // deletebutton handler
    $(document).on('click', '.deletebtn', function (event) {
        // reading item id and session values
        var ingredient = this.id.replace("ingr_", "");
        alerts.delete(ingredient);
        // refreshing view
        $.refreshAlerts();
    });

    //// filters
    $("#filterleft").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        $("#tags option").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });

});