import json

from flask import Flask, render_template, request, redirect, Response, jsonify
import numpy as np
import pandas as pd
import util as u

app = Flask(__name__)
originalData = pd.read_csv('data/data.csv', encoding = "ISO-8859-1")
columns =  ['eventid','iyear','imonth','iday','extended','country','country_txt','region','region_txt','provstate','city','latitude','longitude','specificity','vicinity','location','summary',
'crit1','crit2','crit3','doubtterr','multiple','success','suicide','attacktype1','attacktype1_txt','targtype1','targtype1_txt','targsubtype1','targsubtype1_txt','natlty1','natlty1_txt',
'gname','guncertain1','individual','weaptype1','weaptype1_txt','weapsubtype1','weapsubtype1_txt','nkill','nwound','property','ishostkid']

#Data Cleaning
tempData = originalData[columns]
tempData.drop(tempData[tempData['country_txt']=='International'].index, inplace = True)
tempData.drop(tempData[tempData['country_txt']=='St. Kitts and Nevis'].index, inplace = True)
tempData.drop(tempData[tempData['country_txt']=='St. Lucia'].index, inplace = True)
tempData.drop(tempData[tempData['country_txt']=='Yugoslavia'].index, inplace = True)
tempData.reset_index(inplace=True, drop=True)

currentNames = {'Czechoslovakia':'Czech Republic', 'East Germany (GDR)':'Germany', 'West Germany (FRG)':'Germany',
                'People\'s Republic of the Congo':'Republic of Congo', 'New Hebrides':'Vanuatu', 'North Yemen':'Yemen',
                'South Yemen':'Yemen', 'Rhodesia':'Zimbabwe', 'Serbia-Montenegro':'Serbia', 'South Vietnam':'Vietnam',
                'Soviet Union':'Russia', 'Vatican City':'Italy', 'Zaire':'Democratic Republic of the Congo'}
tempData = tempData.replace({'country_txt': currentNames})

countryCodes = {'Afghanistan':'AFG', 'Albania':'ALB', 'Algeria':'DZA', 'Andorra':'AND', 'Angola':'AGO', 'Antigua and Barbuda':'ATG', 'Argentina':'ARG', 'Armenia':'ARM', 'Australia':'AUS', 'Austria':'AUT', 'Azerbaijan':'AZE', 'Bahamas':'BHS', 'Bahrain':'BHR', 'Bangladesh':'BGD', 'Barbados':'BRB', 'Belarus':'BLR', 'Belgium':'BEL', 'Belize':'BLZ', 'Benin':'BEN', 'Bhutan':'BTN', 'Bolivia':'BOL', 'Bosnia-Herzegovina':'BIH', 'Botswana':'BWA', 'Brazil':'BRA', 'Brunei':'BRN', 'Bulgaria':'BGR', 'Burkina Faso':'BFA', 'Burundi':'BDI', 'Cambodia':'KHM', 'Cameroon':'CMR', 'Canada':'CAN', 'Central African Republic':'CAF', 'Chad':'TCD', 'Chile':'CHL', 'China':'CHN', 'Colombia':'COL', 'Comoros':'COM', 'Costa Rica':'CRI', 'Croatia':'HRV', 'Cuba':'CUB', 'Cyprus':'CYP', 'Czech Republic':'CZE', 'Democratic Republic of the Congo':'COD', 'Denmark':'DNK', 'Djibouti':'DJI', 'Dominica':'DMA', 'Dominican Republic':'DOM', 'East Timor':'TLS', 'Ecuador':'ECU', 'Egypt':'EGY', 'El Salvador':'SLV', 'Equatorial Guinea':'GNQ', 'Eritrea':'ERI', 'Estonia':'EST', 'Ethiopia':'ETH', 'Falkland Islands':'FLK', 'Fiji':'FJI', 'Finland':'FIN', 'France':'FRA', 'French Guiana':'GUF', 'French Polynesia':'PYF', 'Gabon':'GAB', 'Gambia':'GMB', 'Georgia':'GEO', 'Germany':'DEU', 'Ghana':'GHA', 'Greece':'GRC', 'Grenada':'GRD', 'Guadeloupe':'GLP', 'Guatemala':'GTM', 'Guinea':'GIN', 'Guinea-Bissau':'GNB', 'Guyana':'GUY', 'Haiti':'HTI', 'Honduras':'HND', 'Hong Kong':'HKG', 'Hungary':'HUN', 'Iceland':'ISL', 'India':'IND', 'Indonesia':'IDN', 'Iran':'IRN', 'Iraq':'IRQ', 'Ireland':'IRL', 'Israel':'ISR', 'Italy':'ITA', 'Ivory Coast':'CIV', 'Jamaica':'JAM', 'Japan':'JPN', 'Jordan':'JOR', 'Kazakhstan':'KAZ', 'Kenya':'KEN', 'Kosovo':'OSA', 'Kuwait':'KWT', 'Kyrgyzstan':'KGZ', 'Laos':'LAO', 'Latvia':'LVA', 'Lebanon':'LBN', 'Lesotho':'LSO', 'Liberia':'LBR', 'Libya':'LBY', 'Lithuania':'LTU', 'Luxembourg':'LUX', 'Macau':'MAC', 'Macedonia':'MKD', 'Madagascar':'MDG', 'Malawi':'MWI', 'Malaysia':'MYS', 'Maldives':'MDV', 'Mali':'MLI', 'Malta':'MLT', 'Martinique':'MTQ', 'Mauritania':'MRT', 'Mauritius':'MUS', 'Mexico':'MEX', 'Moldova':'MDA', 'Montenegro':'MNE', 'Morocco':'MAR', 'Mozambique':'MOZ', 'Myanmar':'MMR', 'Namibia':'NAM', 'Nepal':'NPL', 'Netherlands':'NLD', 'New Caledonia':'NCL', 'New Zealand':'NZL', 'Nicaragua':'NIC', 'Niger':'NER', 'Nigeria':'NGA', 'North Korea':'PRK', 'Norway':'NOR', 'Pakistan':'PAK', 'Panama':'PAN', 'Papua New Guinea':'PNG', 'Paraguay':'PRY', 'Peru':'PER', 'Philippines':'PHL', 'Poland':'POL', 'Portugal':'PRT', 'Qatar':'QAT', 'Republic of the Congo':'COG', 'Romania':'ROU', 'Russia':'RUS', 'Rwanda':'RWA', 'Saudi Arabia':'SAU', 'Senegal':'SEN', 'Serbia':'SRB', 'Seychelles':'SYC', 'Sierra Leone':'SLE', 'Singapore':'SGP', 'Slovak Republic':'SVK', 'Slovenia':'SVN', 'Solomon Islands':'SLB', 'Somalia':'SOM', 'South Africa':'ZAF', 'South Korea':'KOR', 'South Sudan':'SDS', 'Spain':'ESP', 'Sri Lanka':'LKA', 'Sudan':'SDN', 'Suriname':'SUR', 'Swaziland':'SWZ', 'Sweden':'SWE', 'Switzerland':'CHE', 'Syria':'SYR', 'Taiwan':'TWN', 'Tajikistan':'TJK', 'Tanzania':'TZA', 'Thailand':'THA', 'Togo':'TGO', 'Trinidad and Tobago':'TTO', 'Tunisia':'TUN', 'Turkey':'TUR', 'Turkmenistan':'TKM', 'Uganda':'UGA', 'Ukraine':'UKR', 'United Arab Emirates':'ARE', 'United Kingdom':'GBR', 'United States':'USA', 'Uruguay':'URY', 'Uzbekistan':'UZB', 'Vanuatu':'VUT', 'Venezuela':'VEN', 'Vietnam':'VNM', 'Wallis and Futuna':'WLF', 'West Bank and Gaza Strip':'PSE', 'Western Sahara':'ESH', 'Yemen':'YEM', 'Zambia':'ZMB', 'Zimbabwe':'ZWE'}
def getCountryCode(row):
    return countryCodes.get(row['country_txt'])
tempData['countryCode'] = tempData.apply(lambda row: getCountryCode(row), axis=1)

#Year wise kill counts for choropleth map - tab 1
years = []
for i in range(1970,2018):
    years.append(i)
yearWiseDeaths = pd.DataFrame(0, index=countryCodes.keys(), columns = years)
for i in years:
    yearWiseDeaths[i] = tempData[tempData['iyear']==i].groupby(by=['country_txt'])['nkill'].sum()
yearWiseDeaths = yearWiseDeaths.fillna(0)
yearWiseDeaths['country_txt'] = yearWiseDeaths.index
yearWiseDeaths['countryCode'] = yearWiseDeaths.apply(lambda row: getCountryCode(row), axis=1)



#handle requests
@app.route("/", methods = ['POST', 'GET'])
def index():
    if request.method == 'POST':
        if(request.form['data'].startswith('choropleth')):
            return json.dumps({'choroplethData' : yearWiseDeaths[['countryCode', int(request.form['data'].split('-')[1])]].to_json(orient='records')})
    else:
        return render_template("index.html", data = tempData)

@app.route('/country_data',methods=['GET','POST'])
def get_data():
   data=u.get_country_data()
   return jsonify(data)

@app.route('/dashboard_data',methods=['GET'])
def get_dashboard_data():
   print(request.args) 
   country= request.args['cname']
   data=u.get_dashboard_data(country)
   return jsonify(data)

@app.route('/scat_data',methods=['GET'])
def get_scatter_plot_data():
   print(request.args) 
   country= request.args['cname']
   decade=int(request.args['decade'])
   data=u.get_scatter_plot_data(country,decade)
   return jsonify(data)

@app.route('/scat_pi_data',methods=['GET'])
def get_scat_pi_data():
   data=u.get_scat_pi_data()
   return jsonify(data)

@app.route('/pll_cord_data',methods=['GET'])
def get_parallel_coordinate_data():
   data=u.get_parallel_coordinate_data()
   return jsonify(data)


@app.route('/tab2.html', )
def tab2():
    return render_template('tab2.html')

@app.route('/tab3.html', )
def tab3():
    return render_template('tab3.html')


@app.route('/tab5.html', )
def tab5():
    return render_template('tab5.html')

if __name__ == "__main__":
    app.run(debug=True)
