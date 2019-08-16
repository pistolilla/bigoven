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

// Diets handler
$.dietshandler = function(result) {
    $('#dietsgif').hide();
    //iterating through results
    if (result.length == 0) {
        $("#diets").append('<p class="m-1">Sin resultados</p>');
    }
    $.each(result, function(i, field) {
        // pre-processing fields
        var operator = field.Operator;
        if (operator.length > 0)
            operator = "(" + operator + ")";
        // populating results
        var htmlblock = `
            <div class="list-group-item list-group-item-action flex-column align-items-start">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${field.Title} <small>${operator}</small></h5>
                    <small><button type="button" id="diet_${field.rowid}" class="deletebtn badge btn badge-info">eliminar</button></small>
                </div>
                <p class="mb-1"><i>${field.Comment.replace("\n", "<br/>")}</i></p>
                <small>${field.Tags}</small>
            </div>`;
        $("#diets").append(htmlblock);
    });
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
    // fetching initial tags
    $.getJSON("api/tags/")
    .done(function(result) {
        // iterating through results
        $.each(result, function(i, field) {
            // populating tags
            var tagDisplay = field.Tag;
            if (tagDisplay.length > 20)
                tagDisplay = tagDisplay.substring(1, 20) + "..";
            $("#tags").append('<option value="' + field.Tag + '">' + tagDisplay + ' (' + field.c + ')</option>');
        });
    })
    .fail($.ajaxError);

    // tags select listener
    $("#tags").on('change', function() {
        // clearing and showing gifs
        $("#results, #diets").empty();
        $('#resultsgif, #dietsgif').show();
        // creating JSON object from select
        var tags = $('#tags').val();
        // showing selection to user
        $("#summary").html(tags.join(", "));
        var postBody = 'body=' + JSON.stringify({ tags });

        // recipes
        $.post("api/recipes/", postBody, function(result) {
            $('#resultsgif').hide();
            //iterating through results
            if (result.length == 0) {
                $("#results").append('<p class="m-1">Sin resultados</p>');
            }
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
            });
        }, 'json')
        .fail($.ajaxError);

        // diets
        $.post("api/diets/", postBody, $.dietshandler, 'json')
        .fail($.ajaxError);

    });

    // submitbutton listener
    $("#submitbutton").click(function() {
        // reading selected tags and form values
        var tags = $('#tags').val();
        if (tags.length == 0) {
            alert("No hay etiquetas seleccionadas");
            return;
        }
        var title = $("#title").val();
        if (title.length == 0) {
            alert("El título es obligatorio");
            return;
        }
        var operator = $("#operator").val();
        var comment = $("#comment").val();
        // creating post body
        var postBody = 'body=' + JSON.stringify({ tags, title, operator, comment });
        // clearing and showing gifs
        $("#diets").empty();
        $("#dietsgif").show();
        // ajax call
        $.post("api/diets/", postBody, $.dietshandler, 'json')
        .fail($.ajaxError);
    });

    // deletebutton handler
    $(document).on('click', '.deletebtn', function (event) {
        // confirm action
        var r = confirm("¿Confirma que desea eliminar este elemento?");
        if (r != true)
            return;
        // reading item id and session values
        var rowid = this.id.replace("diet_", "");
        var tags = $('#tags').val();
        // creating post body
        var postBody = 'body=' + JSON.stringify({ tags, rowid });
        // clearing and showing gifs
        $("#diets").empty();
        $("#dietsgif").show();
        // ajax call
        $.post("api/diets/", postBody, $.dietshandler, 'json')
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