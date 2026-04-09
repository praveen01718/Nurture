export const VACCINATION_HEADERS = [
  "Vaccination Details",
  "Birth",
  "6 weeks",
  "10 weeks",
  "14 weeks",
  "6 months",
  "7 months",
  "9 months",
  "15 months",
  "18 months",
  "2 years",
  "more than 2 years"
];

export const VACCINATION_SCHEDULE = [
  {
    name: "BCG",
    doses: [{ age: "Birth", dose: "1st" }]
  },
  {
    name: "Hepatitis B",
    doses: [
      { age: "Birth", dose: "1st" },
      { age: "6 weeks", dose: "2nd" },
      { age: "14 weeks", dose: "3rd" }
    ]
  },
  {
    name: "OPV",
    doses: [
      { age: "Birth", dose: "0th" },
      { age: "6 weeks", dose: "1st" },
      { age: "10 weeks", dose: "2nd" },
      { age: "14 weeks", dose: "3rd" },
      { age: "more than 2 years", dose: "Booster" }
    ]
  },
  {
    name: "IPV",
    doses: [
      { age: "6 weeks", dose: "1st" },
      { age: "14 weeks", dose: "2nd" }
    ]
  },
  {
    name: "Pentavalent",
    doses: [
      { age: "6 weeks", dose: "1st" },
      { age: "10 weeks", dose: "2nd" },
      { age: "14 weeks", dose: "3rd" }
    ]
  },
  {
    name: "Rotavirus",
    doses: [
      { age: "6 weeks", dose: "1st" },
      { age: "10 weeks", dose: "2nd" },
      { age: "14 weeks", dose: "3rd" }
    ]
  },
  {
    name: "MMR",
    doses: [
      { age: "9 months", dose: "1st" },
      { age: "15 months", dose: "2nd" }
    ]
  }
];

const VACCINATION_TYPE_BY_NAME = {
  BCG: "Injection",
  "Hepatitis B": "Injection",
  OPV: "Oral",
  IPV: "Injection",
  Pentavalent: "Injection",
  Rotavirus: "Oral",
  MMR: "Injection"
};

export const VACCINATION_SCHEDULE_DATA = VACCINATION_SCHEDULE.map((item) => ({
  vaccineName: item.name,
  type: VACCINATION_TYPE_BY_NAME[item.name] || "Routine",
  schedule: item.doses.map((dose) => ({
    age: dose.age,
    dose: dose.dose
  }))
}));

export const VACCINATION_NAME_OPTIONS = VACCINATION_SCHEDULE_DATA.map(
  (item) => item.vaccineName
);

export const getAgeOptionsForVaccination = (vaccinationName) => {
  const selectedVaccination = VACCINATION_SCHEDULE.find((item) => item.name === vaccinationName);

  if (!selectedVaccination) {
    return [];
  }

  return [...new Set(selectedVaccination.doses.map((dose) => dose.age))];
};

export const getDoseOptionsForVaccination = (vaccinationName, ageLabel) => {
  const selectedVaccination = VACCINATION_SCHEDULE.find((item) => item.name === vaccinationName);

  if (!selectedVaccination || !ageLabel) {
    return [];
  }

  return selectedVaccination.doses
    .filter((dose) => dose.age === ageLabel)
    .map((dose) => dose.dose);
};

export const formatDoseText = (doseLabel) =>
  doseLabel === "Booster" ? "Booster" : `${doseLabel} dose`;

export const formatVaccinationDate = (dateValue) => {
  if (!dateValue) {
    return "";
  }

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

export const buildVaccinationScheduleRows = (records = []) => {
  const recordMap = new Map(
    records.map((record) => [
      `${record.vaccination_name}::${record.age_label}::${record.dose_label}`,
      record
    ])
  );

  return VACCINATION_SCHEDULE.map((vaccination) => ({
    name: vaccination.name,
    doses: vaccination.doses.map((dose) => {
      const matchedRecord = recordMap.get(
        `${vaccination.name}::${dose.age}::${dose.dose}`
      );

      return {
        age: dose.age,
        label: dose.dose,
        status: matchedRecord ? "done" : "pending",
        date: matchedRecord ? formatVaccinationDate(matchedRecord.vaccination_date) : ""
      };
    })
  }));
};
