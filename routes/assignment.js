const express = require('express')
const { validationResult, check } = require('express-validator');
const auth = require('../middlewares/auth')
const path = require('path')
const Student = require('../models/Student')
const Assignment = require('../models/Assignment')
const router = express.Router();
const multer = require('multer');
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
                assignment: req.file.path
            })
            await assignment.save();
            res.status(200).json(assignment)
        }catch (e) {

            console.log(e)
            res.status(500).send(e.message)
        }

})

module.exports = router;