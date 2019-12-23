const express = require('express')
const { validationResult, check } = require('express-validator');
const auth = require('../middlewares/auth')
const path = require('path')
const Student = require('../models/Student')
const Assignment = require('../models/Assignment')
const router = express.Router();
const multer = require('multer');
const checker = require('../services/checker')
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'data')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname) ) ;
    }
})
const upload = multer({storage: storage})

/**
 * @method POST
 * @param
 * @description add student and their assignment
 */

router.post('/assignment', [
    auth, check('student').not().isEmpty(),
    check('assignment').not().isEmpty(),
    upload.single('assignment')
    ],
    async (req, res) => {
    console.log(req.file);
    //Create student records
        const {student} = req.body;
        try{
            let s_account = await Student.findOne({name: student});
            if(!s_account){
                //Create one
                s_account = await Student({name: student}).save();
            }
            //add assignment
            let assignment = new Assignment({
                student_id : s_account.id,
                filename: req.file.filename,
                assignment: req.file.path
            })
            await assignment.save();
            res.status(200).json(assignment)
        }catch (e) {
            console.log(e)
            res.status(500).send(e.message)
        }

});

router.put('/compare/:first/:second',
    [
        auth
    ],
    async (req, res)=> {
    //get the first student record
        let firstStudent = await Assignment.findById(req.params.first);
        let secondStudent = await Assignment.findById(req.params.second);
        //process comparison
         await checker.createFiles([firstStudent.assignment, secondStudent.assignment], (res, err) => {
            //console.log(res)
             //Save update process Id
            res.Success.forEach(async (item) => {
               let assign =  await Assignment.findOne({filename: item.Filename})
                await assign.updateOne({processId: item.ProcessId})
            });
        })
        //  check result
        let pid = await Assignment.findById(firstStudent.id);
        await checker.checkResults(pid.processId, (res, error) => {
            res.forEach(async (item) => {
                pid.compareResult = item;
                await pid.save();
            })
        });
        let s_pid = await Assignment.findById(secondStudent.id);
        await checker.checkResults(s_pid.processId,  (res, error) => {
            res.forEach(async (item) => {
                console.log('second', item)
                s_pid.compareResult = item;
                await s_pid.save();
            })
        });
    res.status(200).json({
        firstStudent: {
            id: firstStudent.id,
            student: firstStudent.student_id,
            filename: firstStudent.filename,
            percents: firstStudent.compareResult.Percents,
            copiedWords: firstStudent.compareResult.NumberOfCopiedWords,
            title: firstStudent.compareResult.title
        }, secondStudent: {
            id: firstStudent.id,
            student: secondStudent.student_id,
            filename: secondStudent.filename,
            percents: secondStudent.compareResult.Percents,
            copiedWords: secondStudent.compareResult.NumberOfCopiedWords,
            title: secondStudent.compareResult.title
        }
    });
})

module.exports = router;