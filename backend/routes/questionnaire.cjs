const express = require("express");
const db = require("../config/db.cjs");
const axios = require("axios");
const ML_SERVICE_URL =
  process.env.ML_SERVICE_URL || "http://127.0.0.1:8010";


const router = express.Router();

function applyQ2StreamRules(previousStream, predictedStream) {
  const rules = {
    "Pre-Medical": ["Arts", "Commerce", "Pre-Medical", "Pre-Engineering"],
    "Pre-Engineering": ["Arts", "Commerce", "Pre-Engineering"],
    Arts: ["Arts"],
    Commerce: ["Arts", "Commerce"],
  };

  const allowedStreams = rules[previousStream];

  if (!allowedStreams) {
    return predictedStream;
  }

  if (allowedStreams.includes(predictedStream)) {
    return predictedStream;
  }

  return allowedStreams[0];
}

const {
  authenticateToken,
  allowSelfOrRoles,
} = require("../middleware/authMiddleware.js");

function cleanBaseField(field) {
  if (!field) return "General Path";

  if (field.includes(" - ")) {
    return field.split(" - ").pop().trim();
  }

  return field.trim();
}

function chooseGrade8System(data) {
  const englishComfort = data.english_comfort;
  const financialStatus = data.financial_status;

  if (financialStatus === "Prefer government system") {
    return "Matric";
  }

  if (englishComfort === "Yes" && financialStatus === "Can afford tuition") {
    return "O-Level";
  }

  if (englishComfort === "No") {
    return "Matric";
  }

  return "O-Level / Matric";
}

function formatInstitute(city, name) {
  if (!city || city === "Pakistan") return name;
  return `${city} - ${name}`;
}

function getSkills(field) {
  const baseField = cleanBaseField(field);

  const map = {
    "Science Stream": [
      "Analytical Thinking",
      "Problem Solving",
      "Observation",
      "Scientific Curiosity",
    ],
    "Commerce Stream": [
      "Numerical Skills",
      "Communication",
      "Business Thinking",
      "Decision Making",
    ],
    "Arts Stream": ["Creativity", "Writing", "Expression", "Critical Thinking"],
    "Computer Science": [
      "Logic Building",
      "Technology Use",
      "Problem Solving",
      "Digital Literacy",
    ],
    "General Path": ["Self Awareness", "Research", "Adaptability", "Confidence"],

    "Pre-Engineering": [
      "Mathematics",
      "Physics",
      "Problem Solving",
      "Analytical Thinking",
    ],
    Engineering: [
      "Mathematics",
      "Physics",
      "Problem Solving",
      "Analytical Thinking",
    ],
    "Pre-Medical": ["Biology", "Research", "Attention to Detail", "Discipline"],
    Medical: ["Biology", "Research", "Attention to Detail", "Discipline"],
    Commerce: [
      "Accounting",
      "Business Communication",
      "Finance Basics",
      "Numerical Skills",
    ],
    Humanities: ["Writing", "Reading", "Analysis", "Expression"],
    "Humanities / Arts": ["Writing", "Reading", "Analysis", "Expression"],
    Arts: ["Creativity", "Writing", "Critical Thinking", "Presentation"],
  };

  return map[baseField] || ["Communication", "Confidence", "Adaptability"];
}

function getCitySchools(city, field) {
  const baseField = cleanBaseField(field);
  const normalizedCity = (city || "Pakistan").toLowerCase();

  const schoolMap = {
    karachi: {
      default: ["The City School", "Beaconhouse School System", "Karachi Grammar School"],
      "Science Stream": ["Karachi Grammar School", "The City School", "Beaconhouse School System"],
      "Computer Science": ["The City School", "Beaconhouse School System", "Foundation Public School"],
      "Commerce Stream": ["The City School", "Beaconhouse School System", "Foundation Public School"],
      "Arts Stream": ["Beaconhouse School System", "The City School", "Happy Home School"],
    },
    lahore: {
      default: ["Lahore Grammar School", "Beaconhouse School System", "The City School"],
    },
    islamabad: {
      default: ["Roots International Schools", "Beaconhouse School System", "The City School"],
    },
    rawalpindi: {
      default: ["Roots Millennium Schools", "Beaconhouse School System", "The City School"],
    },
    hyderabad: {
      default: ["The City School", "Beaconhouse School System", "Army Public School"],
    },
    sukkur: {
      default: ["The City School", "Beaconhouse School System", "Army Public School"],
    },
    shikarpur: {
      default: ["Government High School Shikarpur", "The City School Sukkur Campus", "IBA Community College Sukkur"],
    },
    multan: {
      default: ["Beaconhouse School System", "The City School", "Roots International Schools"],
    },
    faisalabad: {
      default: ["Beaconhouse School System", "The City School", "Divisional Public School"],
    },
    peshawar: {
      default: ["Beaconhouse School System", "The City School", "Army Public School"],
    },
    quetta: {
      default: ["Beaconhouse School System", "The City School", "Army Public School"],
    },
  };

  const cityData = schoolMap[normalizedCity];

  if (!cityData) {
    return [
      formatInstitute(city, "The City School"),
      formatInstitute(city, "Beaconhouse School System"),
      formatInstitute(city, "Roots International Schools"),
    ];
  }

  return (cityData[baseField] || cityData.default).map((name) =>
    formatInstitute(city, name)
  );
}

function getCityColleges(city, field) {
  const baseField = cleanBaseField(field);
  const normalizedCity = (city || "Pakistan").toLowerCase();

  const collegeMap = {
    karachi: {
      default: ["Bahria College", "PECHS College", "Government College"],
      "Pre-Engineering": ["Adamjee Government Science College", "DJ Science College", "Bahria College"],
      Engineering: ["Adamjee Government Science College", "DJ Science College", "Bahria College"],
      "Pre-Medical": ["DJ Science College", "Adamjee Government Science College", "Bahria College"],
      Medical: ["DJ Science College", "Adamjee Government Science College", "Bahria College"],
      Commerce: ["Commecs College", "Government Degree Commerce College", "Bahria College"],
      Humanities: ["PECHS College", "Bahria College", "Government College for Women"],
      "Humanities / Arts": ["PECHS College", "Bahria College", "Government College for Women"],
      Arts: ["PECHS College", "Bahria College", "Government College for Women"],
    },
    lahore: {
      default: ["Punjab College", "Government College Lahore", "Kinnaird College"],
    },
    islamabad: {
      default: ["Islamabad Model College", "Punjab College", "Roots International College"],
    },
    rawalpindi: {
      default: ["Punjab College", "Fazaia Inter College", "Government Postgraduate College"],
    },
    hyderabad: {
      default: ["Government College", "Superior College", "Punjab College"],
    },
    sukkur: {
      default: ["IBA Public School & College", "Government Degree College", "Superior College"],
    },
    shikarpur: {
      default: ["Government Degree College Shikarpur", "C&S Government College", "IBA Community College Sukkur"],
    },
    multan: {
      default: ["Punjab College", "Government Emerson College", "Superior College"],
    },
    faisalabad: {
      default: ["Punjab College", "Government College", "Superior College"],
    },
    peshawar: {
      default: ["Islamia College", "Edwardes College", "Punjab College"],
    },
    quetta: {
      default: ["Tameer-i-Nau College", "Government Science College", "Balochistan Residential College"],
    },
  };

  const cityData = collegeMap[normalizedCity];

  if (!cityData) {
    return [
      formatInstitute(city, "Punjab College"),
      formatInstitute(city, "Superior College"),
      formatInstitute(city, "Government College"),
    ];
  }

  return (cityData[baseField] || cityData.default).map((name) =>
    formatInstitute(city, name)
  );
}

function getInstitutes(field, level, city) {
  const baseField = cleanBaseField(field);

  const schoolCountry = {
    "Science Stream": [
      formatInstitute("Lahore", "Lahore Grammar School"),
      formatInstitute("Islamabad", "Roots International Schools"),
      formatInstitute("Karachi", "Beaconhouse School System"),
    ],
    "Commerce Stream": [
      formatInstitute("Islamabad", "Roots Millennium Schools"),
      formatInstitute("Karachi", "The City School"),
      formatInstitute("Lahore", "Beaconhouse School System"),
    ],
    "Arts Stream": [
      formatInstitute("Lahore", "Lahore Grammar School"),
      formatInstitute("Islamabad", "Roots International Schools"),
      formatInstitute("Karachi", "Beaconhouse School System"),
    ],
    "Computer Science": [
      formatInstitute("Lahore", "Lahore Grammar School"),
      formatInstitute("Islamabad", "Roots International Schools"),
      formatInstitute("Karachi", "The City School"),
    ],
    "General Path": [
      formatInstitute("Islamabad", "Roots Millennium Schools"),
      formatInstitute("Karachi", "The City School"),
      formatInstitute("Lahore", "Beaconhouse School System"),
    ],
  };

  const collegeCountry = {
    "Pre-Engineering": [
      formatInstitute("Lahore", "Punjab College"),
      formatInstitute("Lahore", "Government College Lahore"),
      formatInstitute("Multan", "Superior College"),
    ],
    Engineering: [
      formatInstitute("Lahore", "Punjab College"),
      formatInstitute("Lahore", "Government College Lahore"),
      formatInstitute("Multan", "Superior College"),
    ],
    "Pre-Medical": [
      formatInstitute("Lahore", "Punjab College"),
      formatInstitute("Lahore", "Government College Lahore"),
      formatInstitute("Lahore", "Kinnaird College"),
    ],
    Medical: [
      formatInstitute("Lahore", "Punjab College"),
      formatInstitute("Lahore", "Government College Lahore"),
      formatInstitute("Lahore", "Kinnaird College"),
    ],
    Commerce: [
      formatInstitute("Lahore", "Punjab College of Commerce"),
      formatInstitute("Lahore", "Lahore College of Commerce"),
      formatInstitute("Multan", "Superior College"),
    ],
    Humanities: [
      formatInstitute("Lahore", "Kinnaird College"),
      formatInstitute("Lahore", "Lahore College for Women"),
      formatInstitute("Islamabad", "Punjab College"),
    ],
    "Humanities / Arts": [
      formatInstitute("Lahore", "Kinnaird College"),
      formatInstitute("Lahore", "Lahore College for Women"),
      formatInstitute("Islamabad", "Punjab College"),
    ],
    Arts: [
      formatInstitute("Lahore", "Kinnaird College"),
      formatInstitute("Lahore", "Lahore College for Women"),
      formatInstitute("Islamabad", "Punjab College"),
    ],
  };

  if (level === "grade8") {
    return {
      cityInstitutes: getCitySchools(city || "Pakistan", baseField),
      countryInstitutes:
        schoolCountry[baseField] || [
          formatInstitute("Karachi", "The City School"),
          formatInstitute("Lahore", "Beaconhouse School System"),
          formatInstitute("Islamabad", "Roots International Schools"),
        ],
    };
  }

  return {
    cityInstitutes: getCityColleges(city || "Pakistan", baseField),
    countryInstitutes:
      collegeCountry[baseField] || [
        formatInstitute("Lahore", "Punjab College"),
        formatInstitute("Multan", "Superior College"),
        formatInstitute("Lahore", "Government College Lahore"),
      ],
  };
}

async function getUserCity(userId) {
  if (!userId) return null;

  const [rows] = await db.promise().query(
    `SELECT city FROM users WHERE id = ? LIMIT 1`,
    [userId]
  );

  if (rows.length === 0) return null;
  return rows[0].city || null;
}

async function saveRecommendation(userId, field, level, city) {
  if (!userId) return;

  const skills = getSkills(field);
  const institutes = getInstitutes(field, level, city);

  await db.promise().query(
    `
    INSERT INTO recommendations
    (user_id, field, skills, city_institutes, country_institutes)
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      userId,
      field,
      JSON.stringify(skills),
      JSON.stringify(institutes.cityInstitutes),
      JSON.stringify(institutes.countryInstitutes),
    ]
  );
}

function buildRecommendationResponse(field, level, city) {
  const skills = getSkills(field);
  const institutes = getInstitutes(field, level, city);

  return {
    prediction: field,
    recommendation: {
      field,
      skills,
      cityInstitutes: institutes.cityInstitutes,
      countryInstitutes: institutes.countryInstitutes,
    },
  };
}

router.get(
  "/latest-recommendation/:userId",
  authenticateToken,
  allowSelfOrRoles("userId", ["guide", "admin"]),
  async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await db.promise().query(
      `
      SELECT id, field, skills, city_institutes, country_institutes, created_at
      FROM recommendations
      WHERE user_id = ?
      ORDER BY id DESC
      LIMIT 1
      `,
      [userId]
    );

    if (rows.length === 0) return res.json(null);

    const item = rows[0];

    res.json({
      id: item.id,
      field: item.field,
      skills: item.skills ? JSON.parse(item.skills) : [],
      cityInstitutes: item.city_institutes ? JSON.parse(item.city_institutes) : [],
      countryInstitutes: item.country_institutes ? JSON.parse(item.country_institutes) : [],
      created_at: item.created_at,
    });
  } catch (error) {
    console.error("Latest recommendation fetch error:", error);
    res.status(500).json({ error: "Failed to fetch latest recommendation" });
  }
});

router.get(
  "/recommendation-history/:userId",
  authenticateToken,
  allowSelfOrRoles("userId", ["guide", "admin"]),
  async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await db.promise().query(
      `
      SELECT id, field, skills, city_institutes, country_institutes, created_at
      FROM recommendations
      WHERE user_id = ?
      ORDER BY id DESC
      `,
      [userId]
    );

    const formatted = rows.map((item) => ({
      id: item.id,
      field: item.field,
      skills: item.skills ? JSON.parse(item.skills) : [],
      cityInstitutes: item.city_institutes ? JSON.parse(item.city_institutes) : [],
      countryInstitutes: item.country_institutes ? JSON.parse(item.country_institutes) : [],
      created_at: item.created_at,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Recommendation history fetch error:", error);
    res.status(500).json({ error: "Failed to fetch recommendation history" });
  }
});

router.post("/q1", async (req, res) => {
  try {
    const data = req.body;
    const user_id = data.user_id || null;

    const [result] = await db.promise().query(
      `INSERT INTO questionnaire1_responses
      (user_id, academic_performance, math_level, science_level, english_level, interest_type, study_consistency, problem_solving, focus_time, learning_style, english_comfort, computer_usage, financial_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        data.academic_performance,
        data.math_level,
        data.science_level,
        data.english_level,
        data.interest_type,
        data.study_consistency,
        data.problem_solving,
        data.focus_time,
        data.learning_style,
        data.english_comfort,
        data.computer_usage,
        data.financial_status,
      ]
    );

    const insertedId = result.insertId;

console.log("======================================");
console.log("Calling ML Service");
console.log("URL:", `${ML_SERVICE_URL}/predict1`);
console.log("Payload:", data);

const mlResponse = await axios.post(
  `${ML_SERVICE_URL}/predict1`,
  data,
  {
    timeout: 10000,
  }
);

console.log("ML Response:", mlResponse.data);
console.log("======================================");

    const predictedStream = mlResponse.data.prediction;

    const recommendedSystem = chooseGrade8System(data);
    const finalPrediction = `${recommendedSystem} - ${predictedStream}`;

    await db.promise().query(
      "UPDATE questionnaire1_responses SET target_stream=? WHERE id=?",
      [finalPrediction, insertedId]
    );

    const city = data.city || (await getUserCity(user_id)) || "Pakistan";

    if (user_id) {
      await saveRecommendation(user_id, finalPrediction, "grade8", city);

      await db.promise().query(
        `INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)`,
        [
          user_id,
          "Recommendation Generated",
          `Your new recommendation is: ${finalPrediction}`,
        ]
      );

      const [guideRows] = await db.promise().query(
        `SELECT guide_id FROM guide_assignments WHERE student_id = ? LIMIT 1`,
        [user_id]
      );

      if (guideRows.length > 0) {
        await db.promise().query(
          `INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)`,
          [
            guideRows[0].guide_id,
            "Student Recommendation Updated",
            "A student under your guidance has a new recommendation.",
          ]
        );
      }
    }

    res.json(buildRecommendationResponse(finalPrediction, "grade8", city));
} catch (err) {
  console.error("======================================");
  console.error("Q1 BACKEND ERROR");
  console.error("Message:", err.message);
  console.error("Code:", err.code);

  if (err.response) {
    console.error("Status:", err.response.status);
    console.error("Response:", err.response.data);
  }

  console.error("======================================");

  return res.status(500).json({
    error:
      err.response?.data?.detail ||
      err.response?.data?.error ||
      err.message ||
      "Server error in Q1",
  });
}

router.post("/q2", async (req, res) => {
  try {
    const data = req.body;
    const user_id = data.user_id || null;

    const [result] = await db.promise().query(
      `INSERT INTO questionnaire2_responses
      (user_id, previous_system, previous_stream, academic_performance, strong_subject, weak_area, interest_area, study_independence, study_hours, analytical_skill, problem_handling, tuition_access, study_preference, career_clarity, decision_factor, confidence_level)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        data.previous_system,
        data.previous_stream,
        data.academic_performance,
        data.strong_subject,
        data.weak_area,
        data.interest_area,
        data.study_independence,
        data.study_hours,
        data.analytical_skill,
        data.problem_handling,
        data.tuition_access,
        data.study_preference,
        data.career_clarity,
        data.decision_factor,
        data.confidence_level,
      ]
    );

    

    const insertedId = result.insertId;

    const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict2`, data);
    const rawPrediction = mlResponse.data.prediction;

    const prediction = applyQ2StreamRules(
    data.previous_stream,
    rawPrediction
     );

    await db.promise().query(
      "UPDATE questionnaire2_responses SET target_stream=? WHERE id=?",
      [prediction, insertedId]
    );

    const city = data.city || (await getUserCity(user_id)) || "Pakistan";

    if (user_id) {
      await saveRecommendation(user_id, prediction, "olevel-matric", city);

      await db.promise().query(
        `INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)`,
        [user_id, "Recommendation Generated", `Your new recommendation is: ${prediction}`]
      );

      const [guideRows] = await db.promise().query(
        `SELECT guide_id FROM guide_assignments WHERE student_id = ? LIMIT 1`,
        [user_id]
      );

      if (guideRows.length > 0) {
        await db.promise().query(
          `INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)`,
          [
            guideRows[0].guide_id,
            "Student Recommendation Updated",
            "A student under your guidance has a new recommendation.",
          ]
        );
      }
    }


    res.json(buildRecommendationResponse(prediction, "olevel-matric", city));
  } catch (err) {
    console.error("Q2 backend error:", err.response?.data || err.message || err);
    return res.status(500).json({
      error:
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        "Server error in Q2",
    });
  }
});

module.exports = router;