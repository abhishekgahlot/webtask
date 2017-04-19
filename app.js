'use latest';

import express from 'express';
import { fromExpress } from 'webtask-tools';

const app = express();

const htmlTemplate = `<!DOCTYPE html>
<html>
    <head>
    </head>
   <body>
      <h1>Hello World!</h1>
   </body>
   <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
   <script>
    $("body").html('<h1> Hello, Dude </h1>');
   </script>
</html>`;

app.get('/', (req, res) => {
  res.send(htmlTemplate);
});



module.exports = fromExpress(app);