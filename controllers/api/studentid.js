// =======================
// Setups controller ================
// =======================

var express = require('express');
var router = express.Router();

const request = require('request');

const config = require('../../config.js');


router.get('/:sid', function (req, res) {
    request.post({
    headers: {'content-type' : 'application/x-www-form-urlencoded'},
    url:     'https://dttc.haui.edu.vn/vn/s/sinh-vien/bang-da-dong?action=p1&p=1&ps=50&exp=FeeTypeName&dir=1',
    body:    's='+req.params.sid
}, function(error, response, body){
    if(response.statusCode != 200){
        res.json({code:config.CODE_ERR_WITH_MESS, message: 'Error with student id'});
        return;
    }
    var tableIndex = body.indexOf("<table ");
    var subcontent = body.substring(0,tableIndex).replace(/&nbsp;/g,'').replace(/\r\n/g,'').replace(/<b class="sName">/g,'').replace(/<\/b>/g,',');
    subcontent = '{"' + subcontent.replace(/.$/,'"}');
    subcontent = subcontent.replace(/:/g, '":"').replace(/,/g,'","');
    subcontent = subcontent.replace(/"\s+/g,'"').replace(/\s+"/g,'"');
    subcontent = subcontent.replace('Họ và tên','name').replace('Lớp','class').replace('Khóa','group');
    var obj = {};
    try
    {
        obj = JSON.parse(subcontent);
            res.json({code: config.CODE_OK_WITH_MESS, data:JSON.parse(subcontent)});
            return;

    }
    catch(err)
    {
        res.json({code: config.CODE_ERR_WITH_MESS, message: 'Error: '+ err});
        return;
    }
    });
});  

module.exports = router;