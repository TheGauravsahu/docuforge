/**
 * Prebuilt Static Document Templates for DocuForge
 * 
 * 100% prebuilt server-side document models that load instantly (0ms)
 * without requiring any Gemini AI API calls. Fully immune to AI quota limits.
 */

export const PREBUILT_TEMPLATES = {
  // 1. Physics Investigatory Project
  tpl_physics_proj: {
    id: 'tpl_physics_proj',
    name: 'Physics Investigatory Project',
    category: 'school-project',
    thumbnailUrl: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600&auto=format&fit=crop&q=80',
    title: 'Electromagnetic Induction & Applications',
    contentJson: {
      theme: {
        fontFamily: 'Georgia',
        primaryColor: '#1E5B3F',
        accentColor: '#C1663E',
        borderColor: '#1E5B3F',
        borderStyle: 'double',
        backgroundColor: '#FAFAF8',
      },
      placeholders: {
        school_name: 'DELHI PUBLIC SCHOOL',
        student_name: 'Gaurav Sahu',
        roll_number: '1210459',
        class: 'Class XII',
        subject: 'Physics',
        guide_teacher: 'Dr. A. P. Sharma',
        academic_year: '2026 - 2027',
        topic_title: 'Electromagnetic Induction & Applications',
      },
      pages: [
        // Page 1: Cover
        {
          id: 'p_cov_physics',
          type: 'cover',
          title: 'Cover Page',
          elements: [
            { id: 'c_1', type: 'text', content: 'DELHI PUBLIC SCHOOL', fontSize: 24, fontWeight: 'bold', align: 'center', x: 45, y: 80, width: 610, color: '#1E5B3F', fontFamily: 'Georgia' },
            { id: 'c_2', type: 'text', content: 'DEPARTMENT OF PHYSICS — CLASS XII', fontSize: 13, fontWeight: 'bold', align: 'center', x: 45, y: 125, width: 610, color: '#1E5B3F', fontFamily: 'Georgia' },
            { id: 'c_3', type: 'text', content: 'INVESTIGATORY PROJECT REPORT', fontSize: 20, fontWeight: 'bold', align: 'center', x: 45, y: 210, width: 610, color: '#1A1A1A', fontFamily: 'Georgia' },
            { id: 'c_4', type: 'text', content: 'ELECTROMAGNETIC INDUCTION & APPLICATIONS', fontSize: 18, fontWeight: 'bold', align: 'center', x: 45, y: 270, width: 610, color: '#1E5B3F', fontFamily: 'Georgia' },
            { id: 'c_5', type: 'text', content: 'Submitted By:\nGaurav Sahu\nRoll Number: 1210459\nClass & Section: Class XII - A\n\nUnder the Guidance of:\nDr. A. P. Sharma\nDepartment of Physics\nDelhi Public School\n\nAcademic Session: 2026 - 2027', fontSize: 13, align: 'center', x: 45, y: 440, width: 610, color: '#222222', fontFamily: 'Georgia' },
          ]
        },
        // Page 2: Certificate
        {
          id: 'p_cert_physics',
          type: 'certificate',
          title: 'Bonafide Certificate',
          elements: [
            { id: 'cert_1', type: 'text', content: 'BONAFIDE CERTIFICATE', fontSize: 22, fontWeight: 'bold', align: 'center', x: 45, y: 70, width: 610, color: '#1E5B3F', fontFamily: 'Georgia' },
            { id: 'cert_sub', type: 'text', content: 'DEPARTMENT OF PHYSICS — DELHI PUBLIC SCHOOL', fontSize: 12, fontWeight: 'bold', align: 'center', x: 45, y: 110, width: 610, color: '#1E5B3F', fontFamily: 'Georgia' },
            { id: 'cert_2', type: 'text', content: 'This is to certify that Gaurav Sahu, a bonafide student of Class XII holding Roll Number 1210459 at Delhi Public School, has successfully completed the investigatory project entitled:\n\n"Electromagnetic Induction & Applications"\n\nduring the academic session 2026 - 2027 in partial fulfillment of the requirements for the Physics curriculum as prescribed by the Board of Examination.', fontSize: 13, align: 'left', x: 45, y: 170, width: 610, color: '#222222', fontFamily: 'Georgia' },
            { id: 'cert_3', type: 'text', content: 'The student has exhibited deep scientific curiosity, analytical rigor, and diligence throughout the experimental work and report preparation under my direct supervision. The results documented herein represent authentic experimental data.', fontSize: 13, align: 'left', x: 45, y: 340, width: 610, color: '#333333', fontFamily: 'Georgia' },
            { id: 'cert_4', type: 'text', content: '___________________________              ___________________________\nTeacher-in-Charge                          Principal / Head of Institution\n(Dr. A. P. Sharma)                          (Delhi Public School)\n\n\n___________________________              ___________________________\nInternal Examiner Signature                External Examiner Signature', fontSize: 12, align: 'left', x: 45, y: 520, width: 610, color: '#1A1A1A', fontFamily: 'Georgia' }
          ]
        },
        // Page 3: Declaration
        {
          id: 'p_decl_physics',
          type: 'declaration',
          title: 'Candidate Declaration',
          elements: [
            { id: 'decl_1', type: 'text', content: 'CANDIDATE DECLARATION', fontSize: 20, fontWeight: 'bold', align: 'center', x: 45, y: 70, width: 610, color: '#1E5B3F', fontFamily: 'Georgia' },
            { id: 'decl_2', type: 'text', content: 'I, Gaurav Sahu, student of Class XII (Roll Number: 1210459) at Delhi Public School, hereby declare that the investigatory project titled:\n\n"Electromagnetic Induction & Applications"\n\nis an authentic record of my own research and experimental work carried out under the academic guidance and supervision of Dr. A. P. Sharma.\n\nI further declare that this report has not been previously submitted for the award of any degree or diploma.', fontSize: 13, align: 'left', x: 45, y: 150, width: 610, color: '#222222', fontFamily: 'Georgia' },
            { id: 'decl_3', type: 'text', content: `Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\nPlace: Delhi Public School`, fontSize: 12, align: 'left', x: 45, y: 440, width: 610, color: '#444444', fontFamily: 'Georgia' },
            { id: 'decl_4', type: 'text', content: '___________________________\nCandidate Signature\n(Gaurav Sahu)\nRoll No: 1210459 | Class XII', fontSize: 12, align: 'left', x: 45, y: 530, width: 610, color: '#1A1A1A', fontFamily: 'Georgia' }
          ]
        },
        // Page 4: Index
        {
          id: 'p_ind_physics',
          type: 'index',
          title: 'Table of Contents',
          elements: [
            { id: 'ind_1', type: 'text', content: 'TABLE OF CONTENTS', fontSize: 20, fontWeight: 'bold', align: 'center', x: 45, y: 70, width: 610, color: '#1E5B3F', fontFamily: 'Georgia' },
            { id: 'ind_2', type: 'text', content: '1. Introduction & Faraday\'s Law of Electromagnetic Induction ..... Page 5\n\n2. Lenz\'s Law & Conservation of Energy ................................. Page 6\n\n3. Mutual & Self Induction Derivations .................................. Page 7\n\n4. Experimental Setup: AC Generator & Transformer Setup ....... Page 8\n\n5. Observations, Eddy Currents & Efficiency Calculations .......... Page 9\n\n6. Bibliography & Reference Sources ...................................... Page 10', fontSize: 13, align: 'left', x: 60, y: 150, width: 580, color: '#333333', fontFamily: 'Georgia' }
          ]
        },
        // Page 5: Chapter 1
        {
          id: 'p_ch1_physics',
          type: 'content',
          title: 'Chapter 1: Faraday\'s Laws',
          elements: [
            { id: 'ch1_t', type: 'text', content: 'CHAPTER 1: FARADAY\'S LAWS OF INDUCTION', fontSize: 18, fontWeight: 'bold', align: 'left', x: 45, y: 60, width: 610, color: '#1E5B3F', fontFamily: 'Georgia' },
            { id: 'ch1_b', type: 'text', content: '1.1 Principles of Electromagnetic Induction:\nElectromagnetic induction is the production of an electromotive force (EMF) across an electrical conductor in a changing magnetic field. Michael Faraday discovered that when magnetic flux linked with a coil changes over time, an induced EMF is produced.\n\n1.2 Faraday\'s First & Second Laws:\nFaraday\'s First Law states that whenever magnetic flux linked with a closed circuit changes, an EMF is induced. Faraday\'s Second Law states that the magnitude of induced EMF is directly proportional to the rate of change of magnetic flux:\n\n   EMF (e) = - d(Phi) / dt\n\nThe negative sign signifies Lenz\'s Law, establishing that the direction of induced current opposes the flux change causing it.', fontSize: 13, align: 'left', x: 45, y: 120, width: 610, color: '#222222', fontFamily: 'Georgia' }
          ]
        },
        // Page 6: Chapter 2
        {
          id: 'p_ch2_physics',
          type: 'content',
          title: 'Chapter 2: Transformers & Generators',
          elements: [
            { id: 'ch2_t', type: 'text', content: 'CHAPTER 2: TRANSFORMERS & GENERATOR MECHANICS', fontSize: 18, fontWeight: 'bold', align: 'left', x: 45, y: 60, width: 610, color: '#1E5B3F', fontFamily: 'Georgia' },
            { id: 'ch2_b', type: 'text', content: '2.1 Working Mechanics of Electrical Transformers:\nA transformer operates on the principle of mutual induction between two primary and secondary coils wound over a soft iron core. The ratio of secondary voltage to primary voltage equals the turns ratio:\n\n   V_s / V_p = N_s / N_p\n\n2.2 Minimizing Energy Losses:\nPrimary energy losses in transformers include flux leakage, resistance of windings, hysteresis loss, and eddy currents. Laminated iron cores are utilized to minimize eddy current heat generation.', fontSize: 13, align: 'left', x: 45, y: 120, width: 610, color: '#222222', fontFamily: 'Georgia' }
          ]
        },
        // Page 7: Bibliography
        {
          id: 'p_bib_physics',
          type: 'bibliography',
          title: 'Bibliography',
          elements: [
            { id: 'bib_1', type: 'text', content: 'BIBLIOGRAPHY & REFERENCES', fontSize: 20, fontWeight: 'bold', align: 'center', x: 45, y: 70, width: 610, color: '#1E5B3F', fontFamily: 'Georgia' },
            { id: 'bib_2', type: 'text', content: '1. NCERT Physics Class XII Textbook, National Council of Educational Research and Training.\n2. Concepts of Physics (Volume 2) — Dr. H. C. Verma.\n3. Fundamentals of Physics — Halliday, Resnick & Walker.\n4. MIT OpenCourseWare: Electricity and Magnetism Lecture Series.', fontSize: 13, align: 'left', x: 60, y: 160, width: 580, color: '#333333', fontFamily: 'Georgia' }
          ]
        }
      ]
    }
  },

  // 2. Certificate of Excellence / Achievement
  tpl_cert_excellence: {
    id: 'tpl_cert_excellence',
    name: 'Certificate of Achievement',
    category: 'certificate',
    thumbnailUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    title: 'Certificate of Excellence & Achievement',
    contentJson: {
      theme: {
        fontFamily: 'Cinzel',
        primaryColor: '#8B6508',
        accentColor: '#D4AF37',
        borderColor: '#D4AF37',
        borderStyle: 'ornamental',
        backgroundColor: '#FFFDF9',
      },
      placeholders: {
        school_name: 'NATIONAL ACADEMIC COUNCIL',
        student_name: 'Gaurav Sahu',
        roll_number: 'CERT-2026-99',
        class: 'Academic Honors',
        subject: 'Science & Innovation',
        guide_teacher: 'Director of Education',
        academic_year: '2026',
        topic_title: 'Excellence in Scientific Research',
      },
      pages: [
        {
          id: 'p_cert_ex',
          type: 'certificate',
          title: 'Certificate of Excellence',
          elements: [
            { id: 'cert_1', type: 'text', content: 'CERTIFICATE OF EXCELLENCE', fontSize: 24, fontWeight: 'bold', align: 'center', x: 45, y: 80, width: 610, color: '#8B6508', fontFamily: 'Cinzel' },
            { id: 'cert_sub', type: 'text', content: 'NATIONAL ACADEMIC COUNCIL FOR SCIENTIFIC INNOVATION', fontSize: 11, fontWeight: 'bold', align: 'center', x: 45, y: 125, width: 610, color: '#D4AF37', fontFamily: 'Cinzel' },
            { id: 'cert_body', type: 'text', content: 'THIS CERTIFICATE IS PROUDLY PRESENTED TO\n\nGaurav Sahu\n\nFOR OUTSTANDING ACADEMIC PERFORMANCE AND DISTINGUISHED INVESTIGATORY RESEARCH IN SCIENTIFIC STUDIES.', fontSize: 14, align: 'center', x: 45, y: 220, width: 610, color: '#222222', fontFamily: 'Cinzel' },
            { id: 'cert_sigs', type: 'text', content: '___________________________              ___________________________\nDirector of Academic Affairs                 Head of Examination Board\n(National Science Council)                   (Academic Excellence)', fontSize: 12, align: 'center', x: 45, y: 620, width: 610, color: '#8B6508', fontFamily: 'Cinzel' }
          ]
        }
      ]
    }
  },

  // 3. Academic Research Report
  tpl_lab_report: {
    id: 'tpl_lab_report',
    name: 'Academic Research Report',
    category: 'report',
    thumbnailUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80',
    title: 'Academic Research Report & Experimental Analysis',
    contentJson: {
      theme: {
        fontFamily: 'Inter',
        primaryColor: '#1E293B',
        accentColor: '#2563EB',
        borderColor: '#2563EB',
        borderStyle: 'single',
        backgroundColor: '#FFFFFF',
      },
      placeholders: {
        school_name: 'INSTITUTE OF ADVANCED RESEARCH',
        student_name: 'Gaurav Sahu',
        roll_number: 'RES-8821',
        class: 'Research Fellow',
        subject: 'Data Science & Chemistry',
        guide_teacher: 'Prof. S. R. Raman',
        academic_year: '2026',
        topic_title: 'Electrochemical Energy Storage Analysis',
      },
      pages: [
        {
          id: 'p_cov_report',
          type: 'cover',
          title: 'Report Cover',
          elements: [
            { id: 'r_1', type: 'text', content: 'INSTITUTE OF ADVANCED RESEARCH', fontSize: 22, fontWeight: 'bold', align: 'center', x: 45, y: 90, width: 610, color: '#1E293B', fontFamily: 'Inter' },
            { id: 'r_2', type: 'text', content: 'LABORATORY RESEARCH REPORT', fontSize: 18, fontWeight: 'bold', align: 'center', x: 45, y: 220, width: 610, color: '#2563EB', fontFamily: 'Inter' },
            { id: 'r_3', type: 'text', content: 'ELECTROCHEMICAL ENERGY STORAGE ANALYSIS', fontSize: 16, fontWeight: 'bold', align: 'center', x: 45, y: 270, width: 610, color: '#1E293B', fontFamily: 'Inter' },
            { id: 'r_4', type: 'text', content: 'Prepared by: Gaurav Sahu\nSupervised by: Prof. S. R. Raman\nDate: 2026', fontSize: 12, align: 'center', x: 45, y: 480, width: 610, color: '#64748B', fontFamily: 'Inter' }
          ]
        },
        {
          id: 'p_ch1_report',
          type: 'content',
          title: 'Research Methodology',
          elements: [
            { id: 'rm_1', type: 'text', content: '1. RESEARCH METHODOLOGY & PROCEDURE', fontSize: 18, fontWeight: 'bold', align: 'left', x: 45, y: 60, width: 610, color: '#1E293B', fontFamily: 'Inter' },
            { id: 'rm_2', type: 'text', content: '1.1 Experimental Apparatus:\nHigh-precision galvanostat, electrolytic cells, cathode-anode test substrates, and digital oscilloscope data logger.\n\n1.2 Data Observations & Derived Efficiency:\nThe energy density of tested lithium-ion cells exhibited an average thermodynamic efficiency of 94.2% under regulated 25°C ambient temperatures.', fontSize: 13, align: 'left', x: 45, y: 120, width: 610, color: '#334155', fontFamily: 'Inter' }
          ]
        }
      ]
    }
  }
};
