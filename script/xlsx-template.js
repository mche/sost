var fs = require('fs');
var XlsxTemplate = require('xlsx-template');


// Load an XLSX file into memory
    fs.readFile('/home/guest/Загрузки/доверка ТДГ.xlsx', function(err, data) {

        // Create a template
        var template = new XlsxTemplate(data);

        // Replacements take place on first sheet
        var sheetNumber = 1;

        // Set up some placeholder values matching the placeholders in the template
        var values = {
                extractDate: new Date(),
                dates: [ new Date("2013-06-01"), new Date("2013-06-02"), new Date("2013-06-03") ],
                people: [
                    {name: "John Smith", age: 20},
                    {name: "Bob Johnson", age: 22}
                ]
            };

        // Perform substitution
        template.substitute(sheetNumber, values);

        // Get binary data
        var data = template.generate();
        //~ process.stdout.write(data);
        //~ console.log(data);
        var wr = fs.createWriteStream('tmp.xlsx');
        wr.write(data, 'binary');
        wr.end();

        // ...

    });