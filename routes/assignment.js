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
        console.log(firstStudent.id)
        let pid = await Assignment.findById(firstStudent.id);

        await checker.checkResults(pid.processId,(res, error) => {
           res.forEach(async (item) => {
               await pid.updateOne(item);
           });
        });

    res.status(200).json({
        firstStudent, secondStudent
    });
})

module.exports = router;