import pandas as pd
import numpy as np

import math as math
from sklearn import preprocessing as pre
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt
from sklearn.preprocessing import StandardScaler
from sklearn.manifold import MDS

terr_data=pd.read_csv("data/data.csv")
terr_csv_data= terr_data.groupby(['country','iyear']).agg({'iyear':'first','country_txt':'first','nkill':['sum'],'eventid':pd.Series.nunique})
hdi_csv_data=pd.read_csv("data/hdi.csv")
me_csv_data=pd.read_csv("data/military_expenditure.csv")
imports=pd.read_csv("data/imports.csv")
exports=pd.read_csv("data/exports.csv")

terr_columns=terr_csv_data.columns

country_data={}
metric_data={}

for data in terr_csv_data.iterrows():
    country=data[1][1]
    year=data[1][0]
    kills=data[1][2]
    events=data[1][3]
    if country not in country_data:
        country_data[country]={}
    if 'kills' not in country_data[country]:
        country_data[country]['kills']={}
    if 'events' not in country_data[country]:
        country_data[country]['events']={}
    try :
        if 'total_kills' in  country_data[country]:           
            country_data[country]['total_kills']+=float(kills)
        else:
            country_data[country]['total_kills']=0
        if 'total_events' in  country_data[country]:           
            country_data[country]['total_events']+=float(events)
        else:
            country_data[country]['total_events']=0            
    except:
        country_data
    country_data[country]['kills'][year]=kills
    country_data[country]['events'][year]=events

def process_yearly_data(csv_data,ystart_index,country_column,metric):
    
    for data in csv_data.iterrows(): 
        c_data={}
        country=data[1][country_column]
        if country not in metric_data:
            metric_data[country]={}
        for i in range(ystart_index,len(csv_data.columns)):
            year=csv_data.columns[i]
            c_data[year]=data[1][i]
            try :
                if 'total_'+metric in  metric_data[country]:           
                    metric_data[country]['total_'+metric]+=float(data[1][i])
                else:
                    metric_data[country]['total_'+metric]=0.0
            except:
                metric_data
        if(metric=='hdi' and country in country_data):
            country_data[country]['hdi_rank']=data[1][0]    
        metric_data[country][metric]=c_data
        
        
    
process_yearly_data(hdi_csv_data,2,1,'hdi')
process_yearly_data(me_csv_data,4,0,'mil_exp')
#process_yearly_data(exports,3,2,'exports')
process_yearly_data(imports,3,2,'imports')

k_data=[]
e_data=[]

print(country_data['New Zealand'])

def get_country_data():
    return {'country_data':country_data}

def get_dashboard_data(country):
    return metric_data[country]


# for Scatter plot of the Data 

def handle_one_hot_encoding(data):
    data=pd.get_dummies(data,columns=['gname'])
    return data

def compute_mds(df,columns,func):
    df=handle_one_hot_encoding(df)
    #df=StandardScaler().fit_transform(df)
    emb = MDS(n_components=2,max_iter=200,n_jobs=-1,dissimilarity=func)
    if(func=='precomputed'):
        df=compute_dissim(df)
    trans = emb.fit_transform(df)
    trans=np.reshape(trans,[trans.shape[1],trans.shape[0]])
    mds_plot_data={
        'x':trans[0].tolist(),
        'y':trans[1].tolist()
    }
    return mds_plot_data

def compute_dissim(data):
    dissim = np.sqrt(1 - np.abs(np.corrcoef(data)))
    dissimilarity = np.triu(dissim.T, k=1) + np.tril(dissim)
    return dissimilarity 

def pick_random_sample(data,reqd_length):
    # picking 25 % of data by random sampling
    p=reqd_length/len(data) 
    n=len(data)
    random_sample=[]
    rand=np.random.binomial(1,p,n)
    k=0
    for i in rand:
        if(i==1):
            random_sample.append(data[k].tolist())
            k+=1
    return random_sample

def get_scatter_plot_data(country,decade):
    start=1970
    df=terr_data.loc[(terr_data['country_txt']==country) & (terr_data['iyear']>=start+10*(decade-1)) & (terr_data['iyear']<=start+10*decade)
                    & (terr_data['gname']!='Unknown') ]
    df=df.fillna(0)
    terr_df=df[['iyear','imonth','country','region','latitude','longitude','attacktype1'
                    ,'suicide','targtype1','natlty1','gname','weaptype1','nkill','nwound']]

    columns=terr_df.columns
    data=np.array(terr_df)

    print("picking random sample")
    random_sampled_data=pick_random_sample(data,500)
    print(len(data))
    df= pd.DataFrame(data=random_sampled_data,columns=columns)

    #making a label for top 5 gangs and rest as others 
    items= df['gname'].value_counts()[:6].index.tolist()
    df['gname']= np.where(np.isin(df['gname'], items) , df['gname'], 'Others')

    #print(df['gname'])
    print("computing MDS")

    mds_cor_1=compute_mds(df,columns,'precomputed')

    #print(mds_cor_1)

    mds_cor_1['g']=df['gname'].to_list()

    print(len(mds_cor_1['x']),len(mds_cor_1['y']),len(mds_cor_1['g']))
    groups={}
    i=0
    for gp in items:
        groups[gp]=i
        i+=1
    mds_cor_1['groups']=groups
    return mds_cor_1