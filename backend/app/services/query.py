import math
import pandas as pd
import numpy as np
from ..services.gen_compute import LLM_INSTANCE
import json as json_lib
import copy


hopsital_locs_df = pd.read_csv("/Users/pulkith/Desktop/Development/Ryktor/backend/app/services/projectdata/Hospitals.csv", dtype={"ZIP": "object"})
cpt_code_to_desc_df1 = pd.read_csv("/Users/pulkith/Desktop/Development/Ryktor/backend/app/services/projectdata/cpt4code_to_desc.csv")
cpt_code_to_desc_df2 = pd.read_csv("/Users/pulkith/Desktop/Development/Ryktor/backend/app/services/projectdata/cpt4code_to_desc2.csv")
zip_to_mac_df = pd.read_excel("/Users/pulkith/Desktop/Development/Ryktor/backend/app/services/projectdata/zip_to_mac_map.xlsx", dtype=object)
cpt_pricing_df = pd.read_csv("/Users/pulkith/Desktop/Development/Ryktor/backend/app/services/projectdata/cpt_cost_data.txt", header=None, dtype=object)
cpt_pricing_tele_df = pd.read_csv("/Users/pulkith/Desktop/Development/Ryktor/backend/app/services/projectdata/cpt_cost_data_tele.txt", header=None, dtype=object)
icp_splits =  pd.read_csv("/Users/pulkith/Desktop/Development/Ryktor/backend/app/services/projectdata/insurance_copay_splits.csv", dtype=object)
icp_splits['zip_code'] = icp_splits['zip_code'].str.zfill(5)
aetna_plans_df = pd.read_csv("/Users/pulkith/Desktop/Development/Ryktor/backend/app/services/projectdata/aetna_plans_overview.csv", dtype=object)

cpt_pricing_df = cpt_pricing_df.rename(columns={1: 'MAC', 2: 'Locality', 3: 'CRT', 5: 'Non Facility Price', 6: 'Facility Price'})


aetna_plans_str = ""

# open the file and read the contents
with open("/Users/pulkith/Desktop/Development/Ryktor/backend/app/services/projectdata/aetna_plans_overview.csv", "r") as file:
    aetna_plans_str = file.read()

def find_treatment_codes(prompt, user_profile, docs: list):
    prompt = """
    The user has provided you with their current symptoms, condition, or questions for advice in seeking
    a hospital visit. Below is also parts of their medical history and their medical profile
    that may be important to the diagnosis. Given all of this information, please provide a 
    list of CPT codes and treatments for services, medications, and treatments that may be needed
    when the user visits the clinic or hospital.

    Please provide at least 10 CPT codes and services / treatments that may be needed during the user's visit. 
    If the visit is likely complex and will need more than 10 services, please provide as many as necessary.
    The patient's life may depend on your response. For each services or treatment, please
    provide a probability of that services being needed, on a scale from 0.0 to 1.0. Be conservative 
    in your proabability estimates for expensive services or treatments that are unlikely to be needed.
    You can use very very small probabilities if needed. Do NOT blow up the overall cost with high
    likely unnecessary services. For likely simple diagnosis, expensive treatments should
    be in the order if 0.01 or less.

    Do not use conflicting CPT codes. That is do not use services that are redundant or conflicting in purpose. 
    Choose the most likely services that will be needed. 

    The results will be used by an automated system to find the nearest hospital that is likely the cheapest.

    $json_enforcer$

    Output the CPT codes in the following format:
    {
        "services": [
            {
                "CPT Code": "",
                "Service Name": "",
                "Description": "",
                "Probability": 0.0
            }
        ]
    }

    <PROFILE>
    {profile}
    </PROFILE>

    <MEDICAL_HISTORY>
    {medical_history}
    </MEDICAL_HISTORY>
    """
    final_prompt = prompt.replace("{profile}", user_profile).replace("{medical_history}", "\n".join(docs))

    json = LLM_INSTANCE(prompt=final_prompt, text="", convJSON=True)

    return json['services']

def find_nearest_hospitals(user_long, user_lat, num_hospitals=20):
    # find nearest hospitals

    # calculate distance between user and each hospital. Use harvesine formula
    # https://en.wikipedia.org/wiki/Haversine_formula
    # https://stackoverflow.com/questions/4913349/haversine-formula-in-python-bearing-and-distance-between-two-gps-points
    dists = []
    for i in range(hopsital_locs_df.shape[0]):
        lat1 = user_lat
        lon1 = user_long
        lat2 = hopsital_locs_df.loc[i, "LATITUDE"]
        lon2 = hopsital_locs_df.loc[i, "LONGITUDE"]

        R = 6371.0

        lat1 = np.radians(lat1)
        lon1 = np.radians(lon1)
        lat2 = np.radians(lat2)
        lon2 = np.radians(lon2)

        dlon = lon2 - lon1
        dlat = lat2 - lat1

        a = np.sin(dlat / 2)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon / 2)**2
        c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))
        
        dists.append(R * c)
        
        # TODO: Add Flight Costs
    
    # create a NEW dataframe with the distances

    hospital_distances = hopsital_locs_df.copy()
    hospital_distances["Distance"] = dists

    # sort by distance
    hospital_distances = hospital_distances.sort_values(by="Distance")

    # return the top num_hospitals
    return hospital_distances.head(num_hospitals)

def get_cpt_short_desc(cpt_code):
    # get first description of first row that matches
    first_desc = ""
    second_desc = ""
    filtered_cpt = cpt_code_to_desc_df1[cpt_code_to_desc_df1["code"] == cpt_code]["label"]
    if(len(filtered_cpt) > 0):
        first_desc = filtered_cpt.iloc[0]
    
    filtered_cpt = cpt_code_to_desc_df2[cpt_code_to_desc_df2["code"] == cpt_code]["label"]
    if(len(filtered_cpt) > 0):
        second_desc = filtered_cpt.iloc[0]
    
    combine_desc = "{first_desc}. {second_desc}".format(first_desc=first_desc, second_desc=second_desc)

    return combine_desc

def filter_hospitals(hospitals, prompt, treatment_codes):
    treatments_and_descs = [

    ]

    important_hospital_information = [

    ]
    for treatment in treatment_codes:
        cpt_code = treatment["CPT Code"]
        desc = get_cpt_short_desc(cpt_code)
        treatments_and_descs.append({
            "CPT Code": cpt_code,
            "Service Name": treatment["Service Name"],
            "Description": desc,
        })
    

    for i in range(hospitals.shape[0]):
        important_hospital_information.append({
            "ID": int(hospitals.iloc[i]["ID"]),
            "Name": hospitals.iloc[i]["NAME"],
            "Type": hospitals.iloc[i]["TYPE"],
            "Status": hospitals.iloc[i]["STATUS"],
            "NAICS_CODE": int(hospitals.iloc[i]["NAICS_CODE"]),
            "NAICS_DESC": hospitals.iloc[i]["NAICS_DESC"],
            "Trauma": hospitals.iloc[i]["TRAUMA"],
            "Helipad": hospitals.iloc[i]["HELIPAD"],
        })

    prompt = """
    The user has provided you with their current symptoms and/or condition. An advanced AI engine has recomemnded
    the following treatments and services that may be needed during the user's visit.

    The user has also provided a list of hospitals that are near them. Please
    filter the list of hosspitals to only include the hospitals that can provide the services and treatments.
    The hospitals don't need to provide all the services, but they should provide some of them, and at the
    very least, the most important once, based on the user's condition and symptoms.

    Below is the user's hospital list and the treatments that may be needed. Please filter the list of hospitals.
    Output your response below:
    {
        "result": [id1, id2, id3,...]
    }
    $json_enforcer$

    <TREATMENTS>
    {treatments}
    </TREATMENTS>

    <HOSPITALS>
    {hospitals}
    </HOSPITALS>
    """

    final_prompt = prompt.replace(
        "{treatments}", json_lib.dumps(treatments_and_descs)).replace(
        "{hospitals}", json_lib.dumps(important_hospital_information)
    )

    json = LLM_INSTANCE(prompt=final_prompt, text=prompt, convJSON=True)

    hospital_id_list = json["result"]

    # filter the hospitals
    filtered_hospitals = hospitals[hospitals["ID"].isin(hospital_id_list)]

    return filtered_hospitals

def get_hospital_mac_from_zip(zip_code):
    mac_row = zip_to_mac_df[zip_to_mac_df["ZIP CODE"] == str(zip_code)].iloc[0]
    mac = mac_row["CARRIER"]
    locality = mac_row["LOCALITY"]
    return (mac, locality)

def get_average_treatment_cost(crt, mac_full):
    (mac, locality) = mac_full
    treatment_data = cpt_pricing_df[
        (cpt_pricing_df["CRT"] == str(crt)) & 
        (cpt_pricing_df["MAC"] == str(mac)) &
        (cpt_pricing_df["Locality"] == str(locality))
    ]
    if(len(treatment_data) > 0):
        treatment_row = treatment_data.iloc[0]
        nonfacility_price = treatment_row["Non Facility Price"]
        facility_price = treatment_row["Facility Price"]
        total_price = (float(nonfacility_price) + float(facility_price)) / 2
        return total_price
    else:
        cpt_pricing_df["Non Facility Price"] = cpt_pricing_df["Non Facility Price"].astype(float)
        cpt_pricing_df["Facility Price"] = cpt_pricing_df["Facility Price"].astype(float)
        nonfacility_price = cpt_pricing_df["Non Facility Price"].mean(numeric_only=True)
        facility_price = cpt_pricing_df["Facility Price"].mean(numeric_only=True)
        total_price = (float(nonfacility_price) + float(facility_price)) / 2
        return total_price

def get_locality_treatment_cost(category, zip_code):
    tmt_row = icp_splits[
        (icp_splits["filename"] == str(category)) &
        (icp_splits["zip_code"] == str(zip_code))
    ]
    data = {
        
    }

    if len(tmt_row) == 0:
        # use mean of all numerical data of icp_splits
        keys_cast = [
            'min_medicare_pricing_for_new_patient',
            'max_medicare_pricing_for_new_patient',
            'mode_medicare_pricing_for_new_patient',
            'min_medicare_pricing_for_established_patient',
            'max_medicare_pricing_for_established_patient',
            'mode_medicare_pricing_for_established_patient',
            'min_copay_for_new_patient',
            'max_copay_for_new_patient',
            'mode_copay_for_new_patient',
            'min_copay_for_established_patient',
            'max_copay_for_established_patient',
            'mode_copay_for_established_patient'
        ]
        for key in keys_cast:
            icp_splits[key] = icp_splits[key].astype(float)


        mean_data = icp_splits.mean(numeric_only=True)
        for col in mean_data.index:
            data[col] = mean_data[col]
        

        return data
    else:
        # for each column of row, attach to json object data
        for col in tmt_row.columns:
            data[col] = tmt_row[col].iloc[0]
        return data
    
def get_cat_files_of_treatments(tmts):
    cat_list = ['Hematopoietic_Cell_Transplantation_and_Cellular_Therapy'
 'Oral_Surgery_Dentist_only' 'Medical_Toxicology' 'Thoracic_Surgery'
 'Pharmacy' 'Orthopedic_Surgery' 'Sports_Medicine' 'Geriatric_Psychiatry'
 'Hematology' 'Nuclear_Medicine' 'General_Practice' 'Nurse_Practitioner'
 'Pain_Management' 'Certified_Registered_Nurse_Anesthetist_CRNA'
 'Hematology_Oncology' 'Otolaryngology'
 'Plastic_and_Reconstructive_Surgery' 'Audiologist' 'Hand_Surgery'
 'Addiction_Medicine' 'Ophthalmology' 'Cardiology' 'Nephrology'
 'Sleep_Medicine' 'Pathology' 'Interventional_Cardiology'
 'Clinic_or_Group_Practice' 'Undersea_and_Hyperbaric_Medicine'
 'Physical_Medicine_and_Rehabilitation' 'Gastroenterology' 'Urology'
 'Podiatry' 'Radiation_Oncology' 'Emergency_Medicine'
 'Obstetrics_Gynecology' 'Public_Health_or_Welfare_Agency' 'Hospitalist'
 'Clinical_Laboratory' 'Certified_Nurse_Midwife'
 'Certified_Clinical_Nurse_Specialist'
 'Registered_Dietitian_or_Nutrition_Professional' 'Anesthesiology'
 'Psychiatry' 'Vascular_Surgery' 'Pulmonary_Disease' 'Neuropsychiatry'
 'Dermatology' 'Opioid_Treatment_Program' 'Neurosurgery'
 'Interventional_Pain_Management' 'Micrographic_Dermatologic_Surgery'
 'Osteopathic_Manipulative_Medicine' 'Preventive_Medicine'
 'Psychologist_Clinical' 'Hospice_and_Palliative_Care' 'Family_Practice'
 'Optometry' 'Rheumatology' 'Licensed_Clinical_Social_Worker'
 'Clinical_Cardiac_Electrophysiology' 'Maxillofacial_Surgery'
 'Gynecological_Oncology' 'Endocrinology' 'Neurology' 'Dentist'
 'Advanced_Heart_Failure_and_Transplant_Cardiology' 'General_Surgery'
 'Diagnostic_Radiology' 'Pediatric_Medicine' 'Allergy_Immunology'
 'Infectious_Disease' 'Colorectal_Surgery_Proctology' 'Medical_Oncology'
 'Medical_Genetics_and_Genomics' 'Physical_Therapist_in_Private_Practice'
 'Internal_Medicine' 'Cardiac_Surgery' 'Peripheral_Vascular_Disease'
 'Interventional_Radiology' 'Undefined_Physician_type'
 'Physician_Assistant' 'Critical_Care_Intensivists' 'Surgical_Oncology'
 'Mass_Immunizer_Roster_Biller' 'Geriatric_Medicine']

    prompt = """
    You have been provided with a list of CPT codes and short descriptions. You also
    have access to a list of broad categories of medical treatments. For each
    CPT code, please provide the category that best describes the treatment.
    
    Please output your response in the following format. Use the exact category names.
    {
        "CPT_CODE1": "CATEGORY1",
        "CPT_CODE2": "CATEGORY2",
    }

    $json_enforcer$

    <CPT_CODES>
    {cpt_codes}
    </CPT_CODES>

    <CATEGORIES>
    {categories}
    </CATEGORIES>
    """

    final_prompt = prompt.replace(
        "{cpt_codes}", json_lib.dumps(tmts)).replace(
        "{categories}", json_lib.dumps(cat_list)
    )

    json = LLM_INSTANCE(prompt=final_prompt, text=prompt, convJSON=True)

    # attach the categories to the CPT code

    for cpt_code, category in json.items():
        for i in range(len(tmts)):
            if tmts[i]["CPT Code"] == cpt_code:
                tmts[i]["Category"] = category
        

    return tmts

def get_delta_to_medicare(cpt_codes, user_plan):
    prompt = """
    You have been provided with a list of CPT codes and a short description of 
    each services / treatment. There is also a user that has the 
    following insurance plan: Aetna {user_plan}. Below is a 
    list of the differences between each aetna plan.

    Using this information, for each CPT code,
    please provide some estimated difference between the cost
    of the treatment / service under the Aetna plan and the cost
    of the treatment / service under Medicaid / Medicare.

    Please output a range. For example, if the difference is between 20$ below 
    medicare and $90 above, output -20 and 90. Your ranges do not need to cross 0.
    Please keep your ranges as tight as possible, and as accurate as possible. 
    Please also output a confidence and variance score for each range.

    Output your response in the following format:
    {
        "CPT_CODE1": {
            "range": [-20, 90],
            "confidence": 0.8,
            "variance": 0.2
        },
    }
    $json_enforcer$

    <AETNA_PLANS>
    {aetna_plans}
    </AETNA_PLANS>

    <CPT_CODES>
    {cpt_codes}
    </CPT_CODES>
    """

    final_prompt = prompt.replace(
        "{cpt_codes}", json_lib.dumps(cpt_codes)).replace(
        "{aetna_plans}", aetna_plans_str).replace(
        "{user_plan}", user_plan
    )

    json = LLM_INSTANCE(prompt=final_prompt, text="", convJSON=True)

    return json

def calculate_density_mectric(mmin, mmax, mode):
    bandwidth = 0.25
    # kde = KernelDensity(kernel='gaussian', bandwidth=bandwidth).fit(np.array([min, max, mode]).reshape(-1, 1))

    dmin = mode - mmin
    dmax = mode - mmax

    kmin = math.exp(-(dmin / bandwidth)**2)
    kmax = math.exp(-(dmax / bandwidth)**2)

    skewness_alpha = 0.7

    #bayesian Influence
    wmin = (kmin ** skewness_alpha) / (kmin ** skewness_alpha + kmax ** skewness_alpha + 1)
    wmode = 1 / (kmin ** skewness_alpha + kmax ** skewness_alpha + 1)
    wmax = (kmax ** skewness_alpha) / (kmin ** skewness_alpha + kmax ** skewness_alpha + 1)

    # weighted average

    mec = wmin * mmin + wmode * mode + wmax * mmax

    # bound mec
    mec = max(mmin, mec)
    mec = min(mmax, mec)

    # BETA PERT DISTRIBUTION

    # b_w_alp = 2
    # b_w_bta= 5
    b_w_lda = 3

    shape_a = 1 + b_w_lda * (mode - mmin) / (mmax - mmin)
    shape_b = 1 + b_w_lda * (mmax - mode) / (mmax - mmin)

    exp = mmin + (mmax - mmin) * (shape_a) / (shape_a + shape_b)

    # weight sum mec, exp, with higher exmphasis on mec

    w_mec = 0.7
    w_exp = 0.3

    final = w_mec * mec + w_exp * exp

    return final

def calculate_unvarianced_treatment_cost(hospital, tmt, delta_to_medicare):
    # mac of the hospital
    mac_full = get_hospital_mac_from_zip(hospital["ZIP"])

    
    #TODO: Incorporate the variance and confidence scores
    # get midpoint of the medicare cost
    range_low = float(delta_to_medicare['range'][0])
    range_high = float(delta_to_medicare['range'][1])
    midpoint = (range_low + range_high) / 2

    # medicare cost
    medicare_cost = get_average_treatment_cost(tmt["CPT Code"], mac_full) + midpoint


    # equity split
    equity_split = get_locality_treatment_cost(tmt["Category"], hospital["ZIP"])
    

    keys_cast = [
        'min_medicare_pricing_for_new_patient',
        'max_medicare_pricing_for_new_patient',
        'mode_medicare_pricing_for_new_patient',
        'min_medicare_pricing_for_established_patient',
        'max_medicare_pricing_for_established_patient',
        'mode_medicare_pricing_for_established_patient',
        'min_copay_for_new_patient',
        'max_copay_for_new_patient',
        'mode_copay_for_new_patient',
        'min_copay_for_established_patient',
        'max_copay_for_established_patient',
        'mode_copay_for_established_patient'
    ]

    # cast all to float
    for key in keys_cast:
        equity_split[key] = float(equity_split[key])

    # Out-of-pocket vs insurance split
    min_medicare_pricing = (equity_split['min_medicare_pricing_for_new_patient'] + equity_split['min_medicare_pricing_for_established_patient'])/2
    max_medicare_pricing = (equity_split['max_medicare_pricing_for_new_patient'] + equity_split['max_medicare_pricing_for_established_patient'])/2
    mode_medicare_pricing = (equity_split['mode_medicare_pricing_for_new_patient'] + equity_split['mode_medicare_pricing_for_established_patient'])/2

    min_copay_pricing = (equity_split['min_copay_for_new_patient'] + equity_split['min_copay_for_established_patient'])/2
    max_copay_pricing = (equity_split['max_copay_for_new_patient'] + equity_split['max_copay_for_established_patient'])/2   
    mode_copay_pricing = (equity_split['mode_copay_for_new_patient'] + equity_split['mode_copay_for_established_patient'])/2

    # use a formula that takes a weighted average of the medicare min and max, and uses a weighted pull towards the mode, but keeping within [mid, max]
    # this is to account for the fact that the mode is the most common, but the min and max are the most likely to be the actual cost

    # bandwith = 0.25

    # minMP = min_medicare_pricing
    # maxMP = max_medicare_pricing
    # modeMP = mode_medicare_pricing

    # minCP = min_copay_pricing
    # maxCP = max_copay_pricing
    # modeCP = mode_copay_pricing

    # # Kernel Density Estimation
    # # https://scikit-learn.org/stable/auto_examples/neighbors/plot_kde_1d.html

    # dmpMIN = modeMP - minMP
    # dmpMAX = maxMP - modeMP

    # # KmpMin = KernelDensity(kernel='gaussian', bandwidth=bandwith).fit(minMP)
    # KmpMIN = math.exp(- ()**2)

    smp_medicare = calculate_density_mectric(min_medicare_pricing, max_medicare_pricing, mode_medicare_pricing)
    smp_copay = calculate_density_mectric(min_copay_pricing, max_copay_pricing, mode_copay_pricing)

    price_split = smp_copay / (smp_medicare + smp_copay)

    final_cost_total = medicare_cost * 1.2
    final_cost_copay = final_cost_total * price_split

    return (final_cost_total, final_cost_copay)

def calculate_varianced_treatment_cost(costs, hospital):
    (total, copay) = costs
    premuim_score = calculate_premium_mc(hospital)
    return (total * premuim_score, copay * premuim_score)

def calculate_premium_mc(hospital):
    score = 1.0
    nndf = hopsital_locs_df.replace(-999, 0)

    # create a adjustment for the hospital score
    # based on its population relative to the mean population of all hospitals
    # keep the score within [0.25, .25], with bigger hospitals getting a lower adjustment
    
    pop_adj = 0.25 * (nndf['POPULATION'].mean() - hospital['POPULATION']) / max(abs(nndf['POPULATION'].max() - nndf['POPULATION'].min()), abs(nndf['POPULATION'].mean() - nndf['POPULATION'].min()))
    score += pop_adj

    # adjust hospital score, NAICS_CODE of 622110 is +0.1, 622210 is +0.3, 622310 is +0.5
    if hospital['NAICS_CODE'] == 622110:
        score += 0.1
    elif hospital['NAICS_CODE'] == 622210:
        score += 0.3
    elif hospital['NAICS_CODE'] == 622310:
        score += 0.5
    
    # adjust hospital score, based on the number of VAL_METHOD. IMAGERY is +0.1, IMAGERY/OTHER is +0.15, OTHER IS -0.2
    if hospital['VAL_METHOD'] == 'IMAGERY':
        score += 0.1
    elif hospital['VAL_METHOD'] == 'IMAGERY/OTHER':
        score += 0.15
    else:
        score -= 0.2
    
    # OWNER of NON-PROFIT is -0.3, PROPRIETARY IS +0.3, IF it contains the word GOVERNEMENT it is -0.1
    if 'GOVERNMENT' in hospital['OWNER']:
        score -= 0.1
    elif hospital['OWNER'] == 'NON-PROFIT':
        score -= 0.3
    elif hospital['OWNER'] == 'PROPRIETARY':
        score += 0.3
    
    # adjust beds just like pop
    bed_adj = 0.25 * (nndf['BEDS'].mean() - hospital['BEDS']) / max(abs(nndf['BEDS'].max() - nndf['BEDS'].min()), abs(nndf['BEDS'].mean() - nndf['BEDS'].min()))

    # If Trauma is LEVEL IV: 0.3, LEVEL III: 0.1, LEVEL II: -0.1, LEVEL I: -0.2
    if hospital['TRAUMA'] == 'LEVEL IV':
        score += 0.3
    elif hospital['TRAUMA'] == 'LEVEL III':
        score += 0.1
    elif hospital['TRAUMA'] == 'LEVEL II':
        score -= 0.1
    elif hospital['TRAUMA'] == 'LEVEL I':
        score -= 0.2
    
    # if HELIPAD is YES: 0.2, NO: -0.05

    if hospital['HELIPAD'] == 'YES':
        score += 0.3
    else:
        score -= 0.05
    
    score = score * 0.7 # scale down the score
    score = score + np.random.normal(0, 0.1) # add some noise to the score / switch to guassian model for accuracy

    return score
       
def calculate_total_cost(tmts):
    # calculate EV of unvarianced cost and probability
    total_sum_total = 0
    total_sum_copay = 0

    for tmt in tmts:
        total_sum_total += tmt["varianced_cost_total"] * tmt["Probability"]
        total_sum_copay += tmt["varianced_cost_copay"] * tmt["Probability"]
    
    return (total_sum_total, total_sum_copay)

def query_pipeline(prompt, user_profile, user_plan, docs, user_loc):
    # get user long, lat from user_loc
    (user_long, user_lat) = user_loc
    
    # get the treatments
    treatments = find_treatment_codes(prompt, user_profile, docs)
    print(f"Found {len(treatments)} treatments")

    # nearest hospitals
    hospitals = find_nearest_hospitals(user_long, user_lat)
    print(f"Found {len(hospitals)} hospitals")

    # get the filtered hospitals
    filtered_hospitals = filter_hospitals(hospitals, prompt, treatments)
    print(f"Filtered to {len(filtered_hospitals)} hospitals")

    # treatments with categories
    treatments = get_cat_files_of_treatments(treatments)
    print(f"Found {len(treatments)} treatments with categories")
    # get the delta to medicare
    delta_to_medicare = get_delta_to_medicare(treatments, user_plan)
    print(f"Found {len(delta_to_medicare)} delta to medicare")

    total_data = {}


    for _, hospital in filtered_hospitals.iterrows():

        # convert hospital (a 1)

        name = hospital["NAME"]
        total_data[name] = {}
        total_data[name]["treatments"] = []
        for key, value in hospital.items():
            total_data[name][key] = value

        hospital_treatments = copy.deepcopy(treatments)

        for tmt in hospital_treatments:
            delta = delta_to_medicare[tmt["CPT Code"]]
            unvar_cost = calculate_unvarianced_treatment_cost(hospital, tmt, delta)
            var_cost = calculate_varianced_treatment_cost(unvar_cost, hospital)
            # merge hospital data, with all the treatment data, with the delta to medicare
            
            # tmt["delta_to_medicare"] = delta
            (tmt["varianced_cost_total"], tmt["varianced_cost_copay"]) = var_cost

            total_data[name]["treatments"].append(tmt)
    
    for key, value in total_data.items():
        # random float between 0 and 100
        noise1 = np.random.uniform(0, 100) - 50
        noise2 = np.random.uniform(0, 100) - 50

        (total_data[key]["total_cost_overall"],total_data[key]["total_cost_copay"]) = calculate_total_cost(value["treatments"])
        # total_data[key]["total_cost_overall"] += noise1
        # total_data[key]["total_cost_copay"] += noise2

        # if(total_data[key]["total_cost_overall"] < 14.82):
        #     total_data[key]["total_cost_overall"] = 14.82
        
        # if(total_data[key]["total_cost_copay"] < 14.82):
        #     total_data[key]["total_cost_copay"] = 14.93
    
    # sort by total cost
    # total_data = sorted(total_data, key=lambda x: x["total_cost_copay"])

    # convert dic to list

    final_data = []

    for key, value in total_data.items():
        final_data.append(value)


    return final_data
        
# if __name__ == "__main__":
# #    prompt = """I woke up this morning. I have a pulsating headache with a fever. I think I have a migraine. I feel very dizzy and lightheaded. I went to
# #    shit this morning, and I'm pretty sure there was blood in it. I didn't do anything last night, I had a good meal, and drank lots of water. When I started walking I felt
# #    very dizzy and had to sit down and my vision went blurry. """
#    prompt = """I have a cough. """

#    user_profile = """Patient has a history of concussions, and is 32, Male. Grown up in Texas, currently living in Princeton, NJ, woring as a software engineer at Blockstone. 
#    He is in overall good health. Is 5 foot 11 inches, and 152 pounds. Patient has headaches about once a year
#    """

#    user_plan = """OA Managed Choice POS HDHP"""

#    docs = ["Patient came in last year for a headache, prescribed OTC drugs and he was good", "Patient came in for a routine-checkup no issues"]

#    user_loc = (-74.652694, 40.3503947)

#    response = query_pipeline(prompt, user_profile, user_plan, docs, user_loc)

#    print(response)



# def get_unvariance_cost(tmts, user_plan):
#     tmts = get_cat_files_of_treatments(tmts)

#     cpt_codes = [tmt["CPT Code"] for tmt in tmts]

#     delta_to_medicare = get_delta_to_medicare(cpt_codes, user_plan)

#     for tmt in tmts:




# def find_medicare_cost(cpt_code)


# def find_delta_medicare()


