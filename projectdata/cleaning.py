import pandas as pd

df = pd.read_csv('Hospitals.csv')

df = df.drop(axis = 1, columns=['X', 
                                'Y', 
                                'OBJECTID', 
                                'ID',
                                'ZIP4',
                                'POPULATION',
                                'COUNTY',
                                'COUNTYFIPS',
                                'COUNTRY',
                                'NAICS_CODE', 
                                'NAICS_DESC', 
                                'SOURCE', 
                                'SOURCEDATE',
                                'VAL_METHOD',
                                'VAL_DATE', 
                                'WEBSITE',
                                'STATE_ID',
                                'ALT_NAME',
                                'ST_FIPS',
                                'OWNER',
                                'TTL_STAFF',
                                'BEDS', 
                                'HELIPAD'
                                ])


df = df[df['STATUS'] != 'CLOSED']

df.to_csv('hospital_trimmed.csv')

a = df['TYPE'].unique()

print(a)
print(df.head)