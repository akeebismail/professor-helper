const CopyleaksCloud = require('plagiarism-checker');
const clCloud = new CopyleaksCloud();
const config = clCloud.getConfig();
const email = 'damiz.kibb@gmail.com';
const apiKey = 'A7D55EBC-CD57-4E87-BD59-36BC205D7B29';
const Assignment = require('../models/Assignment')
const createFiles = (files, callback) => {
    clCloud.login(email,apiKey,config.E_PRODUCT.Education, (res, loginError) => {
        let results = [];
        let _customHeaders = {};
        _customHeaders[config.SANDBOX_MODE_HEADER] = true;
        _customHeaders[config.HTTP_CALLBACK] = 'http://locahost:4200/helper/callback';
        _customHeaders[config.COMPARE_ONLY] = true;
        _customHeaders[config.PARTIAL_SCAN_HEADER] = true;
        clCloud.createByFiles(files, _customHeaders, (resp, err) => {
            results = resp;
            callback(resp, err)
        });

    });
};

const checkResults = (pId, callback) => {
    clCloud.login(email,apiKey,config.E_PRODUCT.Education,(res, err)=> {
        clCloud.getProcessResults(pId, (res, error) => {
            callback(res, error)
        });
    });
};
const compareResult = (url, callback) => {
    clCloud.login(email,apiKey,config.E_PRODUCT.Education,(res, err) => {
        clCloud.getComparisonReport(url, (res, errr)=> {
            callback(res, errr)
        });
    });

};

const updateAssignment = async (array, callback) => {
    for (let index =0; index < array.length; index){
        await Assignment.findOneAndUpdate({filename: array[index].Filename}, {processId: array[index].processId}, {new: true},(done) => {
            console.log(done);
            callback(done)
        });
    }
}

module.exports = {
    createFiles,
    checkResults,
    compareResult,
    updateAssignment
}