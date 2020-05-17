import pandas as pd
import numpy as np

terr_csv_data=pd.read_csv("data/data.csv")
terr_csv_data= terr_csv_data.groupby(['country','country_txt']).agg({'country':'first','country_txt':'first'})

#coutries=terr_csv_data[terr_csv_data.columns[2]]

countries=terr_csv_data['country_txt'].to_list()

me_csv_data=pd.read_csv("data/hdi.csv")

me_countries=me_csv_data['Country'].to_list()

for i in countries:
    if(i not in me_countries):
        print(i)
