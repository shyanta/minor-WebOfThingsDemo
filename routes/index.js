var express = require('express');
var request = require('request');

var router = express.Router();

var counter = 0;
var color ;
var teacherId = '8EA6';
var students = [];

router.get('/', function(req, res){
    res.send('push the button');
});

router.get('/reset', function(req, res){
    var { io } = req;

    io.emit('reset');
    counter = 0;
    console.log('reset');

    students.forEach(function(student){
        // Give students feedback
        request('https://oege.ie.hva.nl/~palr001/icu/api.php?t=sdc&d='+teacherId+'&td='+ student + '&c=00ff00&m=Iedereensnapthet!', function(error, response, data){
            if(error){ throw error; }

            request('https://oege.ie.hva.nl/~palr001/icu/api.php?t=sqi&d='+ teacherId, function (error, response, message){ return 'Ghellooo'; });
        });
    });

    students.forEach(function(student){
        // Remove all students
        request('https://oege.ie.hva.nl/~palr001/icu/api.php?t=rdc&d='+student+'&td='+ teacherId + '&c=00ff00', function(error, response, data){
            if(error){ throw error; }
            students.pop(student);
        });
    });
    res.send('test');
});


router.get('/test', function(req,res){
    var { arduinoPort } = req;

    arduinoPort.on('data', function(data) {
        console.log(data);
    });
    res.send(req.roomAir);
});


router.get('/:chipId', function(req,res){
    var { chipId } = req.params;
    var { io } = req;

    if (!students.includes(chipId)) {
        students.push(chipId);
        counter++;
        request('https://oege.ie.hva.nl/~palr001/icu/api.php?t=sdc&d='+chipId+'&td='+chipId+'&c=ff0000', function (error, response, data){
           request('https://oege.ie.hva.nl/~palr001/icu/api.php?t=sqi&d='+chipId, function (error, response, message){
                console.log(chipId + ' snapt het niet');
           });
	    });
    } else {
        students.splice(students.indexOf(chipId),1);
		request('https://oege.ie.hva.nl/~palr001/icu/api.php?t=sdc&d='+chipId+'&td='+chipId+'&c=00ff00', function (error, response, data){
	        request('https://oege.ie.hva.nl/~palr001/icu/api.php?t=sqi&d='+chipId, function (error, response, message){
				console.log(chipId + ' snapt het weer');
			});
	    });
	}


    if (counter == 0) {
        color = '00FF00';
    } else if (counter == 1) {
        color = 'FFF000';
    } else if (counter == 2) {
        color = 'FF6200';
    } else if (counter >= 3) {
        color = 'FF0000';
    }

			if (students.length == 0){
				counter = 0;
				console.log(counter + 'hoi');
				request('https://oege.ie.hva.nl/~palr001/icu/api.php?t=sdc&d='+chipId+'&td='+teacherId+'&c=00FF00', function (error, response, data){
					request('https://oege.ie.hva.nl/~palr001/icu/api.php?t=sqi&d='+chipId, function (error, response, message){
						console.log('reset teacher to green');
					});
				});
			} else {
				request('https://oege.ie.hva.nl/~palr001/icu/api.php?t=sdc&d='+chipId+'&td='+teacherId+'&c='+color, function (error, response, data){
					request('https://oege.ie.hva.nl/~palr001/icu/api.php?t=sqi&d='+chipId, function (error, response, message){
						io.emit('counter', counter);
						console.log(counter);
						console.log(students);
            			res.render('test',{title: counter});
					});
				});
			}
    // });
	// if (counter === 0 ) {
	// 	res.redirect('/reset');
	// }
});


module.exports = router;
