# 36 Delhi CAAQMS Monitoring Stations from training notebook
DELHI_STATIONS = [
    {"id": "alipur", "name": "Alipur, Delhi - DPCC", "shortName": "Alipur", "lat": 28.8153, "lng": 77.1530, "aqi": 204, "pm25": 115, "pm10": 210, "no2": 32.4, "co": 1.4, "o3": 18.5},
    {"id": "anand_vihar", "name": "Anand Vihar, Delhi - DPCC", "shortName": "Anand Vihar", "lat": 28.6469, "lng": 77.3160, "aqi": 312, "pm25": 180, "pm10": 340, "no2": 58.2, "co": 2.8, "o3": 14.1},
    {"id": "ashok_vihar", "name": "Ashok Vihar, Delhi - DPCC", "shortName": "Ashok Vihar", "lat": 28.6954, "lng": 77.1817, "aqi": 239, "pm25": 130, "pm10": 245, "no2": 41.0, "co": 1.6, "o3": 21.0},
    {"id": "aya_nagar", "name": "Aya Nagar, Delhi - IMD", "shortName": "Aya Nagar", "lat": 28.4707, "lng": 77.1099, "aqi": 165, "pm25": 78, "pm10": 150, "no2": 24.5, "co": 0.9, "o3": 26.3},
    {"id": "bawana", "name": "Bawana, Delhi - DPCC", "shortName": "Bawana", "lat": 28.7762, "lng": 77.0511, "aqi": 245, "pm25": 135, "pm10": 260, "no2": 38.6, "co": 1.8, "o3": 19.4},
    {"id": "crri_mathura_rd", "name": "CRRI Mathura Road, Delhi - IMD", "shortName": "CRRI Mathura Rd", "lat": 28.5512, "lng": 77.2736, "aqi": 213, "pm25": 105, "pm10": 200, "no2": 33.1, "co": 1.3, "o3": 22.0},
    {"id": "dtu", "name": "DTU, Delhi - CPCB", "shortName": "DTU", "lat": 28.7501, "lng": 77.1113, "aqi": 186, "pm25": 92, "pm10": 180, "no2": 29.0, "co": 1.1, "o3": 24.8},
    {"id": "dr_karni_singh", "name": "Dr. Karni Singh Shooting Range, Delhi - DPCC", "shortName": "Karni Singh Range", "lat": 28.4986, "lng": 77.2648, "aqi": 215, "pm25": 110, "pm10": 205, "no2": 30.5, "co": 1.2, "o3": 25.1},
    {"id": "dwarka_sec_8", "name": "Dwarka-Sector 8, Delhi - DPCC", "shortName": "Dwarka Sec-8", "lat": 28.5710, "lng": 77.0719, "aqi": 203, "pm25": 98, "pm10": 195, "no2": 31.0, "co": 1.2, "o3": 23.4},
    {"id": "igi_airport", "name": "IGI Airport (T3), Delhi - IMD", "shortName": "IGI Airport T3", "lat": 28.5628, "lng": 77.0984, "aqi": 216, "pm25": 108, "pm10": 210, "no2": 35.8, "co": 1.5, "o3": 20.2},
    {"id": "ihbas", "name": "IHBAS, Dilshad Garden, Delhi - CPCB", "shortName": "Dilshad Garden", "lat": 28.6811, "lng": 77.3152, "aqi": 191, "pm25": 94, "pm10": 185, "no2": 28.4, "co": 1.0, "o3": 27.5},
    {"id": "ito", "name": "ITO, Delhi - CPCB", "shortName": "ITO", "lat": 28.6317, "lng": 77.2494, "aqi": 190, "pm25": 95, "pm10": 180, "no2": 42.0, "co": 1.7, "o3": 16.9},
    {"id": "jahangirpuri", "name": "Jahangirpuri, Delhi - DPCC", "shortName": "Jahangirpuri", "lat": 28.7328, "lng": 77.1706, "aqi": 250, "pm25": 140, "pm10": 270, "no2": 46.2, "co": 1.9, "o3": 17.8},
    {"id": "jl_stadium", "name": "Jawaharlal Nehru Stadium, Delhi - DPCC", "shortName": "JLN Stadium", "lat": 28.5802, "lng": 77.2338, "aqi": 233, "pm25": 125, "pm10": 220, "no2": 37.5, "co": 1.4, "o3": 21.6},
    {"id": "lodhi_road", "name": "Lodhi Road, Delhi - IMD", "shortName": "Lodhi Road", "lat": 28.5918, "lng": 77.2273, "aqi": 184, "pm25": 88, "pm10": 175, "no2": 26.0, "co": 0.9, "o3": 28.0},
    {"id": "major_dhyan_chand", "name": "Major Dhyan Chand National Stadium, Delhi - DPCC", "shortName": "National Stadium", "lat": 28.6117, "lng": 77.2378, "aqi": 179, "pm25": 85, "pm10": 170, "no2": 25.2, "co": 0.9, "o3": 29.1},
    {"id": "mandir_marg", "name": "Mandir Marg, Delhi - DPCC", "shortName": "Mandir Marg", "lat": 28.6365, "lng": 77.2011, "aqi": 191, "pm25": 92, "pm10": 185, "no2": 31.8, "co": 1.2, "o3": 24.3},
    {"id": "mundka", "name": "Mundka, Delhi - DPCC", "shortName": "Mundka", "lat": 28.6847, "lng": 77.0766, "aqi": 275, "pm25": 155, "pm10": 290, "no2": 49.0, "co": 2.1, "o3": 16.5},
    {"id": "nsit_dwarka", "name": "NSIT Dwarka, Delhi - CPCB", "shortName": "NSIT Dwarka", "lat": 28.6091, "lng": 77.0345, "aqi": 227, "pm25": 118, "pm10": 215, "no2": 34.0, "co": 1.3, "o3": 22.8},
    {"id": "najafgarh", "name": "Najafgarh, Delhi - DPCC", "shortName": "Najafgarh", "lat": 28.5701, "lng": 76.9338, "aqi": 210, "pm25": 105, "pm10": 200, "no2": 29.8, "co": 1.1, "o3": 25.0},
    {"id": "narela", "name": "Narela, Delhi - DPCC", "shortName": "Narela", "lat": 28.8228, "lng": 77.1019, "aqi": 222, "pm25": 112, "pm10": 215, "no2": 32.5, "co": 1.2, "o3": 23.7},
    {"id": "nehru_nagar", "name": "Nehru Nagar, Delhi - DPCC", "shortName": "Nehru Nagar", "lat": 28.5679, "lng": 77.2505, "aqi": 243, "pm25": 132, "pm10": 235, "no2": 44.1, "co": 1.7, "o3": 19.8},
    {"id": "north_campus", "name": "North Campus, DU, Delhi - IMD", "shortName": "North Campus DU", "lat": 28.6904, "lng": 77.2072, "aqi": 226, "pm25": 120, "pm10": 220, "no2": 36.4, "co": 1.4, "o3": 21.5},
    {"id": "okhla_phase_2", "name": "Okhla Phase-2, Delhi - DPCC", "shortName": "Okhla Phase-2", "lat": 28.5308, "lng": 77.2716, "aqi": 216, "pm25": 110, "pm10": 210, "no2": 35.0, "co": 1.3, "o3": 22.4},
    {"id": "patparganj", "name": "Patparganj, Delhi - DPCC", "shortName": "Patparganj", "lat": 28.6238, "lng": 77.2872, "aqi": 241, "pm25": 128, "pm10": 235, "no2": 41.5, "co": 1.6, "o3": 19.2},
    {"id": "punjabi_bagh", "name": "Punjabi Bagh, Delhi - DPCC", "shortName": "Punjabi Bagh", "lat": 28.6740, "lng": 77.1310, "aqi": 216, "pm25": 110, "pm10": 210, "no2": 38.0, "co": 1.4, "o3": 20.8},
    {"id": "pusa_dpcc", "name": "Pusa, Delhi - DPCC", "shortName": "Pusa DPCC", "lat": 28.6396, "lng": 77.1463, "aqi": 225, "pm25": 118, "pm10": 215, "no2": 33.2, "co": 1.2, "o3": 23.0},
    {"id": "pusa_imd", "name": "Pusa, Delhi - IMD", "shortName": "Pusa IMD", "lat": 28.6362, "lng": 77.1567, "aqi": 218, "pm25": 112, "pm10": 208, "no2": 31.0, "co": 1.1, "o3": 24.5},
    {"id": "rk_puram", "name": "R K Puram, Delhi - DPCC", "shortName": "R K Puram", "lat": 28.5632, "lng": 77.1869, "aqi": 172, "pm25": 82, "pm10": 165, "no2": 26.5, "co": 0.9, "o3": 27.2},
    {"id": "rohini", "name": "Rohini, Delhi - DPCC", "shortName": "Rohini", "lat": 28.7325, "lng": 77.1199, "aqi": 244, "pm25": 130, "pm10": 238, "no2": 42.0, "co": 1.5, "o3": 20.1},
    {"id": "shadipur", "name": "Shadipur, Delhi - CPCB", "shortName": "Shadipur", "lat": 28.6514, "lng": 77.1581, "aqi": 227, "pm25": 120, "pm10": 220, "no2": 37.0, "co": 1.4, "o3": 21.0},
    {"id": "sirifort", "name": "Sirifort, Delhi - CPCB", "shortName": "Sirifort", "lat": 28.5504, "lng": 77.2159, "aqi": 212, "pm25": 108, "pm10": 205, "no2": 29.5, "co": 1.1, "o3": 25.4},
    {"id": "sonia_vihar", "name": "Sonia Vihar, Delhi - DPCC", "shortName": "Sonia Vihar", "lat": 28.7105, "lng": 77.2494, "aqi": 225, "pm25": 115, "pm10": 218, "no2": 34.8, "co": 1.3, "o3": 22.6},
    {"id": "sri_aurobindo", "name": "Sri Aurobindo Marg, Delhi - DPCC", "shortName": "Aurobindo Marg", "lat": 28.5313, "lng": 77.1901, "aqi": 191, "pm25": 92, "pm10": 182, "no2": 27.0, "co": 1.0, "o3": 27.0},
    {"id": "vivek_vihar", "name": "Vivek Vihar, Delhi - DPCC", "shortName": "Vivek Vihar", "lat": 28.6723, "lng": 77.3153, "aqi": 241, "pm25": 128, "pm10": 235, "no2": 43.0, "co": 1.6, "o3": 19.5},
    {"id": "wazirpur", "name": "Wazirpur, Delhi - DPCC", "shortName": "Wazirpur", "lat": 28.6997, "lng": 77.1654, "aqi": 239, "pm25": 126, "pm10": 232, "no2": 41.2, "co": 1.5, "o3": 20.4}
]

def get_all_stations():
    return DELHI_STATIONS

def get_station_by_id_or_name(identifier: str):
    for s in DELHI_STATIONS:
        if s["id"] == identifier or s["name"] == identifier or s["shortName"] == identifier:
            return s
    return DELHI_STATIONS[0]