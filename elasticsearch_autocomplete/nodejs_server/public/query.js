
function search_areas(search_query){
  $.ajax({
    url: "/search",
    method: "GET",
    data: {search: search_query}
  }).done(function(response) {
    $("#results").html("");
    var table = "<table class='table'><thead>\
    <tr>\
    <th>City</th>\
    <th>State</th>\
    <th>Country</th>\
    </tr>\
    </thead>\
    <tbody>";
    var hits = response.result.hits.hits
    for(var i=0; i < hits.length; i++){
      table += "<tr>\
      <th>"+ hits[i]._source.city +"</th>\
      <th>"+ hits[i]._source.state +"</th>\
      <th>"+ hits[i]._source.country +"</th>\
      </tr>";
    }
    table += "</tbody>\
    </table>";
    $("#results").html(table);
  });
}
