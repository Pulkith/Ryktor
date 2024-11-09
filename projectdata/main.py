import pandas as pd
from generate import create_copayment

df = pd.DataFrame(columns = ['Hospital', 'Treatment', 'Value'])

treatments = pd.read_csv('treatments.csv')
hospitals = pd.read_csv('hospital_trimmed.csv')
hospitals = hospitals.reset_index()
hospitals = hospitals.head(1)

for index, row in hospitals.iterrows():
    for index2, row2 in treatments.iterrows():
        value = create_copayment(row2['Lower Bound'], row2['Upper Bound'], 10)
        df2 = pd.DataFrame([{'Hospital': row['NAME'], 'Treatment': row2['Service'], 'Value': value}])
        df = pd.concat([df, df2], ignore_index=True)

df.to_csv('Generated.csv')