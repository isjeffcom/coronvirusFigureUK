# UK Coronavirus Data API
![](https://i.ibb.co/Jj2H6wT/logoc.png)
The live COVID-19 data scraper getting data from government and other sources


[API Example Figure](http://coronauk.isjeff.com/ "API Example Figure")
[API Example History](http://coronauk.isjeff.com/history "API Example History")
[Data Example](http://coronauk.isjeff.com/visual "Data Example")

## Getting Started

This sourcecode require very basic nodejs skill, if you dont, you can just used the example API.

1. install mysql database > create a 'corona' database > import 'sample.sql'
2. config database info in database.js under 'new DbClient' constructor
3. install lastest nodejs and run
	`npm i`
	`node index.js` or `npm run dev`
4. open `http://localhost:8003`

## Data Visualization Source code
[covid-19-datav](https://github.com/isjeffcom/covid-19-datav-uk "covid-19-datav")


## Importance
1. Due to the announcement structure from the source may constantly changing, all data will be updated to current_shadow table waiting for admin approve. Admin can use link: http://HOST/approve?token= with token in the first row of your user table, to update to official current table.

2. The wrong virus related data may cause chaos into the society, and the source data structure is not stable, false data might produced in the automatic process, so you do not want to update without admin approval.

3. As I am not a professional coder, I am welcome if anyone can help me improve this project.

## Powered By
Standard NodeJs + ExpressJs along with superagent, cheerio, node-schedule. Detail is in: package.json.

## Data Source

### Figure
UK GOV: https://www.gov.uk/guidance/coronavirus-covid-19-information-for-the-public
Worldometers: https://www.worldometers.info/coronavirus/

### Area Data
England: https://www.gov.uk/guidance/coronavirus-covid-19-information-for-the-public
Scotland: https://www.gov.scot/coronavirus-covid-19/


