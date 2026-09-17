# Heavy Equipment Selling Price Prediction Challenge

[![Kaggle Leaderboard](https://img.shields.io/badge/Kaggle%20Rank-135%20%2F%202%2C593%20(Top%205.2%25)-20beff?style=for-the-badge&logo=kaggle&logoColor=white)](https://github.com/anaskhan-pd/heavy-equipment-price-prediction)
[![Course Evaluation](https://img.shields.io/badge/IIT%20Madras-S%20Grade%20(95%2F100)-10b981?style=for-the-badge&logo=iit&logoColor=white)](https://github.com/anaskhan-pd/heavy-equipment-price-prediction)
[![RMSLE](https://img.shields.io/badge/Test%20RMSLE-0.18227-6366f1?style=for-the-badge)](https://github.com/anaskhan-pd/heavy-equipment-price-prediction)
[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12-3776ab?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)

> **Interactive Portfolio Website**: [**https://anaskhan-pd.github.io/heavy-equipment-price-prediction/**](https://anaskhan-pd.github.io/heavy-equipment-price-prediction/)  
> **Academic Context**: IIT Madras BS Degree in Data Science & Applications - Machine Learning Practice (MLP 2026 T2)  
> **Author**: Anas Khan (Roll No: `24f100851`)  

---

## Executive Summary

This repository presents an industrial-grade tabular machine learning system developed to forecast auction clearing prices for used heavy equipment (excavators, track-type tractors, wheel loaders, backhoes, and motor graders). 

By transforming 50 raw, highly sparse transaction features into **252 engineered domain predictors**—and combining 6 diverse gradient-boosted tree families via **Level-2 Ridge and ElasticNet stacking meta-learners**—this solution achieved:
- **Kaggle Leaderboard Rank**: **135 / 2,593** teams worldwide (**Top 5.20%**)
- **Kaggle Test RMSLE**: **0.18227**
- **IIT Madras Academic Evaluation**: **S Grade (95 / 100)**
- **Local Out-of-Fold Validation (5-Fold CV)**: **0.19673 RMSLE** (improving from a baseline of `0.67194`)

---

## Key Performance Benchmarks

| Model / Architecture | Validation Strategy | RMSLE Score | Relative Gain vs Baseline |
| :--- | :--- | :---: | :---: |
| **Dummy Regressor Baseline** | Global Mean | `0.67194` | Reference |
| **Extra Trees Regressor** | 5-Fold OOF | `0.21366` | +68.2% |
| **CatBoost (Model 1 - Deep)** | 5-Fold OOF | `0.20583` | +69.4% |
| **CatBoost (Model 2 - Shallow)** | 5-Fold OOF | `0.20468` | +69.5% |
| **LightGBM (Model 2 - Reg 127L)** | 5-Fold OOF | `0.20088` | +70.1% |
| **LightGBM (Model 1 - Deep 255L)** | 5-Fold OOF | `0.19962` | +70.3% |
| **XGBoost Regressor (Top Base Learner)** | 5-Fold OOF | `0.19907` | +70.4% |
| **Ridge Stacking Meta-Learner ($\alpha=1.0$)** | Level-2 Stacking | `0.19673` | +70.7% |
| **ElasticNet Meta-Learner ($\alpha=0.0005$)** | Level-2 Stacking | `0.19676` | +70.7% |
| **Final Blended Ensemble (Test Eval)** | **Kaggle Leaderboard** | **`0.18227`** | **Top 5.2% Rank** |

> [!NOTE]
> **Score Distinction**: Local validation is strictly evaluated via 5-fold Out-Of-Fold (OOF) cross-validation on the 138,701 training rows. The final competition score (`0.18227`) is evaluated on the independent Kaggle private/public test dataset of 15,000 unlabelled auctions.

---

## The Machine Learning Architecture

```
┌───────────────────────────┐
│   Raw Auction Ingestion   │ 138,701 Train Records | 15,000 Test Records (50 Raw Attributes)
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│ Domain Feature Extraction │ • Regex Parsers (Stick length, metric tons, tire sizes, horsepower)
│   & Temporal Engineering  │ • Cyclical Encodings (sin/cos on Month, Quarter, Day-of-Week)
└─────────────┬─────────────┘ • Economic Distances (|TransactionYear - 2006| Boom index)
              │
              ▼
┌───────────────────────────┐
│   Leak-Free Encodings &   │ • 5-Fold Out-of-Fold Bayesian Target Encoding (smoothed)
│    Column Transformer     │ • Pairwise High-Impact Category Interactions (e.g. Category × Region)
└─────────────┬─────────────┘ • Out-of-fold Group Aggregations (Mean & Std Hours by BaseClass)
              │
              ▼ (Expanded to 252 Engineered Features)
┌────────────────────────────────────────────────────────────────────────┐
│                   6 Diverse Base Learners (5-Fold CV)                  │
│  LightGBM Deep (0.1996)  │  LightGBM Reg (0.2008)  │  XGBoost (0.1990) │
│  CatBoost Deep (0.2058)  │  CatBoost Fast (0.2046) │  ExtraTrees(0.213)│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Out-of-Fold Prediction Matrix
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     Level-2 Stacking Meta-Learners                     │
│               Ridge Regression (α=1.0) & ElasticNet (α=0.0005)         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Averaging & Quantile Clipping [0.001, 0.999]
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│           Final Prediction Output (Kaggle Test RMSLE: 0.18227)         │
└────────────────────────────────────────────────────────────────────────┘
```

### 1. Mathematical Formulation
The competition objective metric is **Root Mean Squared Logarithmic Error (RMSLE)**:
$$\text{RMSLE}(y, \hat{y}) = \sqrt{\frac{1}{N}\sum_{i=1}^{N} \left(\log(y_i + 1) - \log(\hat{y}_i + 1)\right)^2}$$

Because computing standard RMSE on log-transformed targets is mathematically equivalent to RMSLE, our pipeline fits all models directly on $z_i = \log(y_i + 1)$ (`np.log1p`) using standard mean squared error loss, followed by exponential re-transformation (`np.expm1`).

### 2. Domain Feature Engineering
1. **Physical Specification Parsers**:
   - Extracted numeric metric horsepower, digging depths, and tonnage from freeform descriptors (`HP_Mid`, `Ton_Mid`, `DigDepth_Mid`).
   - Parsed equipment stick lengths from feet-and-inch notation (e.g. `12' 4"` $\rightarrow$ `148.0` inches).
2. **Wear & Depreciation Indices**:
   - `EquipmentAge = clip(TransactionYear - ManufactureYear, 0, 60)`
   - `HoursPerYear = OperationalHoursMeter / max(EquipmentAge, 1)`
   - Multi-way polynomial interaction: `Age × LogHours × ScaleFactor`.
3. **Macroeconomic Boom-Cycle Sensitivity**:
   - `YearsFromBoom = |TransactionYear - 2006|`, indexing machinery value to the pre-2008 peak construction cycle.
4. **Leak-Free Target Statistics**:
   - Applied 5-fold K-Fold Bayesian Target Encoding with empirical smoothing parameter $m=10$.
   - Group aggregations computing the mean and variance of operational hours per machine base subclass.

---

## Dataset Description & Sharing Policy

- **Training Records**: 138,701 rows × 50 columns
- **Test Records**: 15,000 rows × 49 columns
- **Target**: `TargetValue` (Continuous auction transaction clearing price in USD)
---

## Repository Structure

```
heavy-equipment-price-prediction/
├── docs/                               # Modern Showcase Portfolio Website (GitHub Pages)
│   ├── index.html                      # Semantic HTML5 showcase landing page
│   ├── style.css                       # Modern dark minimalist CSS design system
│   ├── script.js                       # Interactive valuation playground & lightbox engine
│   └── assets/                         # Visual assets & vector diagrams
│       ├── pipeline.svg                # Architecture pipeline flowchart
│       ├── depreciation_curve.svg      # Empirical equipment depreciation chart
│       ├── leaderboard_card.jpg        # Verified Kaggle leaderboard standing card (high-res)
│       └── leaderboard_card.svg        # Pure vector standalone leaderboard card
├── notebooks/                          # Jupyter Notebooks
│   └── heavy_equipment_price_prediction.ipynb   # Complete 5-Fold ML pipeline & stacking
├── 24f1000851-notebook-2026t2.ipynb    # Original course notebook submission
├── .gitignore                          # Safeguards against committing datasets & cache
├── LICENSE                             # MIT License
└── README.md                           # Comprehensive project documentation
```

---

## Local Setup & Exploration

### 1. Clone the Repository
```bash
git clone https://github.com/anaskhan-pd/heavy-equipment-price-prediction.git
cd heavy-equipment-price-prediction
```

### 2. Environment Setup
```bash
python -m venv .venv
# On Windows PowerShell:
.venv\Scripts\Activate.ps1
# On macOS / Linux:
source .venv/bin/activate

pip install numpy pandas scikit-learn lightgbm xgboost catboost matplotlib seaborn jupyter
```

### 3. Run the Showcase Website Locally
The website has zero runtime dependencies and requires no build steps:
```bash
# Using Python built-in HTTP server:
python -m http.server 8080 --directory docs

# Or using Node.js npx:
npx serve docs
```
Open your browser and navigate to `http://localhost:8080/`.

---

## Author & Academic Acknowledgements

- **Author**: Anas Khan
- **Degree**: BS in Data Science and Applications, **Indian Institute of Technology Madras (IIT Madras)**
- **Course**: Machine Learning Practice (MLP) — 2026 Term 2
- **GitHub**: [@anaskhan-pd](https://github.com/anaskhan-pd)
- **Linkedin**: [@anaskhan-pd](https://www.linkedin.com/in/anaskhan-pd/).

---

## License

This project is licensed under the [MIT License](LICENSE).
