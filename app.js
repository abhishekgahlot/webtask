'use latest';

import express from 'express';
import request from 'request';
import bodyParser from 'body-parser'
import { fromExpress } from 'webtask-tools';

const app = express();
app.use(bodyParser.urlencoded());

// Get this from https://developers.facebook.com/tools/explorer/
const facebookAccessToken = 'TOKEN_HERE';
const appAuthToken = 'BATMAN'; //specify this as your app password

const htmlTemplate = function(params) { 
  return `<!DOCTYPE html>
    <html>
    <head>
      <link rel="stylesheet" href="https://bootswatch.com/flatly/bootstrap.min.css">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/switchery/0.8.2/switchery.min.css">
      <style>.form-control:focus {border-color:#3ba0ff;} .form-group{margin-bottom:30px;} .panel-heading{ padding: 17px 25px; } .panel-body{padding-top:30px;} .btn-success, .btn-success:hover, .btn-success:focus { background-color: #3ba0ff; border-color: #3ba0ff;} </style>
    </head>
   <body style="padding:80px;background: #f1f1f1;">
      <div class="panel panel-default" id="response-wrapper" style="display:none;">
        <div class="panel-body" id="response" style="padding-top:15px;">
        </div>
      </div>
      <div class="panel panel-default" style="border-color:#bbbbbb;">
        <div class="panel-heading">
          <h3 class="panel-title" style="font-size: 20px;">Publish Post to Social Platforms</h3>
            <div class="panel-options pull-right">
                 <i class="fa fa-chevron-down"></i>
                 <i class="fa fa-times"></i>
            </div>
        </div>
        <div class="panel-body">
          <form class="form-horizontal" role="form">
          <div class="form-group">
            <label class="col-sm-1 control-label">Content</label>
            <div class="col-sm-11">
              <textarea id="post" class="form-control" rows="3" placeholder="First Post using webtask."></textarea>
            </div>
          </div>
          <div class="form-group">
            <label class="col-sm-1 control-label">Platforms</label>
            <div class="col-sm-11">
              <label for="minimal-input-red" style="width:100px">Facebook</label>
              <input id="facebook" type="checkbox" class="js-switch-blue" />
              <br><br>
            </div>
          </div>
          <div class="form-group">
            <label class="col-sm-1 control-label">Authorization Code</label>
            <div class="col-sm-11">
              <input type="password" id="auth" class="form-control" placeholder="Authorization Code set when initializing webtask.">
            </div>
          </div>
          <div class="form-group">
            <div class="col-sm-offset-1 col-sm-10">
              <button id="submit" class="btn btn-success">Post Now!</button>
            </div>
          </div>
        </form>
        </div>
       </div>
   </body>
   <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
   <script src="https://cdnjs.cloudflare.com/ajax/libs/switchery/0.8.2/switchery.min.js"></script>
   <script>
    var elems = Array.prototype.slice.call(document.querySelectorAll('.js-switch-blue'));
    elems.forEach(function(html) {
        var switchery = new Switchery(html, {color: '#3ba0ff'});
    });
    function getForm() {
      var auth = document.getElementById('auth').value;
      var post = document.getElementById('post').value;
      var facebook = document.getElementById('facebook').checked;
      return [post, [facebook], auth];
    }

    $('#submit').on("click", function(e) {
      e.preventDefault();
      var data = getForm();
      $.post(window.location.href + "/post", { post: data[0], facebook: data[1][0], auth: data[2] })
      .done(function(data) {
        $("#response-wrapper").show()
        $("#response").text(data);
      });
    });
   </script>
</html>`;
};

function facebookPost(accessToken, post) {
  const url = 'https://graph.facebook.com/v2.9/me/feed';
  const qs = {
    access_token: accessToken,
    message: post
  };

  return new Promise((resolve, reject) => {
    request.post({url, qs}, (err, resp, body) => {
      if (err) { reject(err); return; }
      resolve(JSON.parse(body));
    });
  });
}

app.get('/', (req, res) => {
  res.send(htmlTemplate());
});

app.post('/post', (req, res) => {
  let post = req.body.post;
  let facebookBool = req.body.facebook;
  let auth = req.body.auth;

  if (facebookBool && auth === appAuthToken) {
    facebookPost(facebookAccessToken, post)
    .then((data) => {
      res.send(JSON.stringify(data));
    })
    .catch((err) => {
      res.send(JSON.stringify(err));
    });
  } else {
    res.send('Your authorization code is incorrect.');
  }
});

module.exports = fromExpress(app);