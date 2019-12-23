var CopyleaksCloud = require('plagiarism-checker');
var clCloud = new CopyleaksCloud();
var config = clCloud.getConfig();
var email = 'damiz.kibb@gmail.com';
var apiKey = 'A7D55EBC-CD57-4E87-BD59-36BC205D7B29';
const callback = (resp, err)=> {
    var _customHeaders = {};
    _customHeaders[config.SANDBOX_MODE_HEADER] = true;
    _customHeaders[config.HTTP_CALLBACK] = 'http://locahost:4200/helper/callback';
    _customHeaders[config.COMPARE_ONLY] = true;
    _customHeaders[config.PARTIAL_SCAN_HEADER] = true;
    clCloud.createByFiles([__dirname+'/data/student1.pdf',__dirname+'/data/student2.pdf'], _customHeaders, (resp, err) => {
        console.log(resp, err)
        if (resp && resp.ProcessId){
            console.log('Processing files');
            console.log(resp)
        } else {
            console.log(err)
        }
    })
}

const checkResult = (resp, err) => {
    clCloud.getProcessResults('d70297bb-5e12-43b0-936e-614f38abb775', (res, error) => {
        console.log(res)
    })
};

const compareResult = (res, err) => {
    clCloud.getComparisonReport('https://api.copyleaks.com/v1/downloads/comparison?rid=13986003', (res, err)=> {
        console.log(res)
    })
}
clCloud.login(email,apiKey,config.E_PRODUCT.Education,compareResult);
