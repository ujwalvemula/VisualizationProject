import pandas as pd
import numpy as np
import itertools
import math as math
from sklearn import preprocessing as pre
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt
from sklearn.preprocessing import StandardScaler
from sklearn.manifold import MDS
from scipy.stats import zscore

terr_data=pd.read_csv("data/data.csv")
terr_data['latitude']=terr_data['latitude'].fillna(0.0)
terr_data['longitude']=terr_data['longitude'].fillna(0.0)
terr_csv_data= terr_data.groupby(['country','iyear']).agg({'iyear':'first','country_txt':'first','nkill':['sum'],'eventid':pd.Series.nunique,'latitude':'mean','longitude':'mean'})
hdi_csv_data=pd.read_csv("data/hdi.csv").fillna(0.0)
me_csv_data=pd.read_csv("data/military_expenditure.csv").fillna(0.0)
imports=pd.read_csv("data/imports.csv").fillna(0.0)
exports=pd.read_csv("data/exports.csv").fillna(0.0)

#Generate StateWise Statistics
state_df=terr_data.groupby(['country','provstate']).agg({'country_txt':'first','provstate':'first','nkill':'sum'})

#Generate CityWise Statistics
city_df=terr_data.groupby(['country','provstate']).agg({'country_txt':'first','city':'first','nkill':'sum'})


terr_columns=terr_csv_data.columns

country_data={}
metric_data={}

for data in terr_csv_data.iterrows():
    country=data[1][1]
    year=data[1][0]
    kills=data[1][2]
    events=data[1][3]
    if country not in country_data:
        country_data[country]={'latitude':data[1][4],'longitude':data[1][5]}
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

def get_country_data():
    return {'country_data':country_data}

def get_dashboard_data(country):
    #adding state and city data
    curr_state_df=state_df.loc[ (state_df[state_df.columns[0]]==country) & (state_df[state_df.columns[1]]!='Unknown') ][[state_df.columns[1],state_df.columns[2]]]
    curr_state_df=curr_state_df.sort_values(state_df.columns[2]).head(5)
    curr_city_df=city_df.loc[(city_df[city_df.columns[0]]==country) & (city_df[city_df.columns[1]]!='Unknown') ][[city_df.columns[1],city_df.columns[2]]]
    curr_city_df=curr_city_df.sort_values(city_df.columns[2]).head(5)
    attacks=terr_data[(terr_data['country_txt']==country) & (terr_data['attacktype1_txt']!='Unknown')]['attacktype1_txt'].value_counts()[:10]
    return {'metric_data':metric_data[country],'state_data':curr_state_df.values.tolist(),'city_data':curr_city_df.values.tolist(),
            'attacks':list(zip(attacks.index.tolist(), attacks.tolist()))}


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
    items= df['gname'].value_counts()[:6].index.tolist()
    
    df['gname']= np.where(np.isin(df['gname'], items) , df['gname'], 'Others')
    df['targsubtype1_txt']= np.where( df['targsubtype1_txt'] != 0 , df['targsubtype1_txt'], 'Unknown')
    data=np.array(df)

    print("picking random sample")
    
    if(len(data)>600):
        data=pick_random_sample(data,600)

    df= pd.DataFrame(data=data,columns=df.columns)   

    terr_df=df[['iyear','imonth','country','region','latitude','longitude','attacktype1'
                    ,'suicide','targtype1','targsubtype1','natlty1','gname','weaptype1','nkill','nwound']]
  
    print("computing MDS")

    mds_cor_1=compute_mds(terr_df,terr_df.columns,'euclidean')

    #print(mds_cor_1)

    mds_cor_1['g']=terr_df['gname'].to_list()
    '''
    if(len(mds_cor_1['x'])>300):
        mds_cor_1=remove_outliers(mds_cor_1)
    print(len(mds_cor_1['x']))
    '''
    groups={}
    i=0
    for gp in items:
        groups[gp]=i
        i+=1
    mds_cor_1['groups']=groups

    sunburst_df=df.groupby(['gname','targtype1_txt','targsubtype1_txt']).agg({'targsubtype1_txt':['count']})
    s_list=flatten_hierarchial_data(sunburst_df)
    mds_cor_1['sun_burst']=s_list
    return mds_cor_1


def flatten_hierarchial_data(data):
    lev1={}
    for i in data.itertuples(index=True, name='Pandas'):
        if(i[0][0] not in lev1):
            lev1[i[0][0]]={}
        if(i[0][1] not in lev1[i[0][0]] ):
            lev1[i[0][0]][i[0][1]]={}
        lev1[i[0][0]][i[0][1]][i[0][2]]=i[1]
        
    return {'name':'data','children':serialize(lev1) }

def serialize(data):
    d=[]
    item={}
    for i in data.keys():
        if (type(data[i]) is int):
            item={'name':i , 'size':data[i] }
        else:
            item={'name':i , 'children':serialize(data[i]) }
        d.append(item)
    return d

def remove_outliers(data):
    print(len(data['x']))
    q1 = np.percentile(data['x'], 5)
    q3 = np.percentile(data['x'], 95)
    tvx=[ i>=q1 and i<=q3 for i in data['x']]
    q1 = np.percentile(data['y'], 5)
    q3 = np.percentile(data['y'], 95)
    tvy=[j>=q1 and j<=q3 for j in data['y']]
    tv=tvx or tvy
    #print(tv)
    data['x']=list(itertools.compress(data['x'],tv )) 
    data['y']=list(itertools.compress(data['y'],tv ))
    data['g']=list(itertools.compress(data['g'],tv ))
    
    return data

def get_scat_pi_data():
    country_df= terr_data.groupby('country').agg({'country_txt':'first','nkill':['sum']})
    country_df=country_df.sort_values(country_df.columns[1],ascending=False)[:10]
    #print(country_df)
    return {'countries':country_df[country_df.columns[0]].tolist()}

#get_scatter_plot_data('India',4)

def get_parallel_coordinate_data():
    #columns [iyear,country_txt,nkill,nwound,attacktype1_txt,targtype1_txt,weaptype1_txt,gname,hdi,mil_exp,imports]
    df=terr_data[['iyear','eventid','nkill','country_txt']]
    # for top 10 countries victim nations
    items= df['country_txt'].value_counts()[:10].index.tolist()
    df=df.loc[df['country_txt'].isin(items) & (df['iyear']>=1990) ]
    df1= df.groupby(['country_txt','iyear']).agg({'nkill':['sum'],'eventid':pd.Series.nunique})
    print(df1)
    parallel_data=[]
    min=[float('inf') for i in range(6)]
    max=[float('-inf') for i in range(6)]
    countries=set()
    for i in df1.itertuples(index=True, name='Pandas'):
        country=i[0][0]
        year=str(i[0][1])
        if all( l in metric_data[country].keys() for l in ['hdi','mil_exp','imports'] ):            
            item={'country':country,'year':int(year),'nkills':i[1],'nincidents':i[2],'hdi':float(metric_data[country]['hdi'][year]),
                'mil_exp':metric_data[country]['mil_exp'][year],'imports':metric_data[country]['imports'][year] }
        parallel_data.append(item) 
        columns=["year","hdi","nincidents", "imports","nkills" ,"mil_exp"]
        for x in range(len(columns)):
            if(min[x]>item[columns[x]]):
                min[x]=item[columns[x]]
            if(max[x]<item[columns[x]]):
                max[x]=item[columns[x]]
        countries.add(country)
    data={'parallel_data':parallel_data,'max':max,'min':min,'countries':list(countries)}
    return data

