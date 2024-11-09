import pandas as pd
import numpy as np

def create_copayment (lower_bound, upper_bound, ratio):
    std = (upper_bound - lower_bound) / ratio # the higher the ratio the smaller the std
    value = np.random.normal(scale = std, loc = (lower_bound + upper_bound)/2)
    return value
