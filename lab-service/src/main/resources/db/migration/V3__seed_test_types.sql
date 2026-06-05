-- =============================================================
-- V3__seed_test_types.sql — Seed common lab test types
-- =============================================================

INSERT INTO lab_test_types (name, category, sample_type, description) VALUES
  ('Complete Blood Count (CBC)', 'Hematology', 'Blood', 'Measures red/white blood cells, hemoglobin, hematocrit, and platelets'),
  ('Basic Metabolic Panel (BMP)', 'Chemistry', 'Blood', 'Measures glucose, calcium, electrolytes, and kidney function markers'),
  ('Comprehensive Metabolic Panel (CMP)', 'Chemistry', 'Blood', 'Includes BMP plus liver function tests (ALT, AST, albumin, bilirubin)'),
  ('Lipid Panel', 'Chemistry', 'Blood', 'Measures total cholesterol, LDL, HDL, and triglycerides'),
  ('Liver Function Tests (LFT)', 'Chemistry', 'Blood', 'Measures ALT, AST, ALP, bilirubin, albumin, and total protein'),
  ('Thyroid Panel (TSH, T3, T4)', 'Endocrinology', 'Blood', 'Measures thyroid-stimulating hormone, triiodothyronine, and thyroxine'),
  ('Hemoglobin A1C (HbA1c)', 'Endocrinology', 'Blood', 'Measures average blood sugar levels over 2-3 months'),
  ('Fasting Blood Glucose', 'Chemistry', 'Blood', 'Measures blood sugar after overnight fasting'),
  ('Urinalysis', 'Urinalysis', 'Urine', 'Examines appearance, concentration, and content of urine'),
  ('Urine Culture', 'Microbiology', 'Urine', 'Identifies bacteria causing urinary tract infections'),
  ('Blood Culture', 'Microbiology', 'Blood', 'Detects bacteria or fungi in the bloodstream'),
  ('Coagulation Panel (PT/INR, aPTT)', 'Hematology', 'Blood', 'Measures blood clotting time and function'),
  ('C-Reactive Protein (CRP)', 'Immunology', 'Blood', 'Measures inflammation levels in the body'),
  ('Erythrocyte Sedimentation Rate (ESR)', 'Hematology', 'Blood', 'Non-specific marker for inflammation'),
  ('Chest X-Ray', 'Radiology', 'N/A', 'Imaging of the chest, heart, and lungs'),
  ('ECG / EKG', 'Cardiology', 'N/A', 'Records electrical activity of the heart'),
  ('Blood Type and Crossmatch', 'Blood Bank', 'Blood', 'Determines ABO and Rh blood type for transfusion compatibility'),
  ('Prothrombin Time (PT)', 'Hematology', 'Blood', 'Evaluates the extrinsic and common coagulation pathway'),
  ('Renal Function Panel', 'Chemistry', 'Blood', 'Measures BUN, creatinine, eGFR for kidney health assessment'),
  ('Vitamin D Level', 'Chemistry', 'Blood', 'Measures 25-hydroxyvitamin D levels'),
  ('Iron Studies (Ferritin, TIBC)', 'Hematology', 'Blood', 'Evaluates iron deficiency or overload'),
  ('HIV Screening', 'Serology', 'Blood', 'Screens for HIV-1 and HIV-2 antibodies and antigen'),
  ('Hepatitis B Panel', 'Serology', 'Blood', 'Screens for hepatitis B surface antigen and antibodies'),
  ('Hepatitis C Antibody', 'Serology', 'Blood', 'Screens for hepatitis C virus antibodies'),
  ('COVID-19 PCR Test', 'Molecular', 'Nasopharyngeal Swab', 'Detects SARS-CoV-2 RNA via polymerase chain reaction');
