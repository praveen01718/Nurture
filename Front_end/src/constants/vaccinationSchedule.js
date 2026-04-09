export const VACCINATION_SCHEDULE = [
  {
    age: "Birth",
    vaccines: [
      { name: "BCG", type: "BCG", dose: "0th" },
      { name: "Polio", type: "OPV", dose: "0th" },
      { name: "Hepatitis B", type: "HepB", dose: "0th" }
    ]
  },
  {
    age: "6 Weeks",
    vaccines: [
      { name: "DTP", type: "DTwP", dose: "1st" },
      { name: "Polio", type: "IPV", dose: "1st" },
      { name: "Hib", type: "Hib", dose: "1st" },
      { name: "Hepatitis B", type: "HepB", dose: "1st" },
      { name: "Rotavirus", type: "RV", dose: "1st" },
      { name: "Pneumococcal", type: "PCV", dose: "1st" }
    ]
  },
  {
    age: "10 Weeks",
    vaccines: [
      { name: "DTP", type: "DTwP", dose: "2nd" },
      { name: "Polio", type: "IPV", dose: "2nd" },
      { name: "Hib", type: "Hib", dose: "2nd" },
      { name: "Hepatitis B", type: "HepB", dose: "2nd" },
      { name: "Rotavirus", type: "RV", dose: "2nd" },
      { name: "Pneumococcal", type: "PCV", dose: "2nd" }
    ]
  },
  {
    age: "14 Weeks",
    vaccines: [
      { name: "DTP", type: "DTwP", dose: "3rd" },
      { name: "Polio", type: "IPV", dose: "3rd" },
      { name: "Hib", type: "Hib", dose: "3rd" },
      { name: "Rotavirus", type: "RV", dose: "3rd" },
      { name: "Pneumococcal", type: "PCV", dose: "3rd" }
    ]
  },
  {
    age: "6 Months",
    vaccines: [
      { name: "Polio", type: "OPV", dose: "Booster" },
      { name: "Influenza", type: "Flu", dose: "1st" }
    ]
  },
  {
    age: "7 Months",
    vaccines: [
      { name: "Influenza", type: "Flu", dose: "2nd" }
    ]
  },
  {
    age: "9 Months",
    vaccines: [
      { name: "MMR", type: "MMR", dose: "1st" },
      { name: "Japanese Encephalitis", type: "JE", dose: "1st" }
    ]
  },
  {
    age: "12 Months",
    vaccines: [
      { name: "Hepatitis A", type: "HepA", dose: "1st" }
    ]
  },
  {
    age: "15 Months",
    vaccines: [
      { name: "MMR", type: "MMR", dose: "2nd" },
      { name: "Varicella", type: "Varicella", dose: "1st" },
      { name: "Pneumococcal", type: "PCV", dose: "Booster" }
    ]
  },
  {
    age: "16-18 Months",
    vaccines: [
      { name: "DTP", type: "DTwP", dose: "Booster" },
      { name: "Polio", type: "IPV", dose: "Booster" },
      { name: "Hib", type: "Hib", dose: "Booster" }
    ]
  },
  {
    age: "18 Months",
    vaccines: [
      { name: "Hepatitis A", type: "HepA", dose: "2nd" }
    ]
  },
  {
    age: "2 Years",
    vaccines: [
      { name: "Typhoid", type: "TCV", dose: "1st" }
    ]
  },
  {
    age: "4-6 Years",
    vaccines: [
      { name: "DTP", type: "DTaP", dose: "Booster" },
      { name: "Polio", type: "OPV", dose: "Booster" },
      { name: "MMR", type: "MMR", dose: "3rd" },
      { name: "Varicella", type: "Varicella", dose: "2nd" }
    ]
  }
];

export const VACCINATION_HEADERS = [
  "Vaccination Details",
  ...VACCINATION_SCHEDULE.map((section) => section.age)
];

const vaccineNameMap = new Map();

VACCINATION_SCHEDULE.forEach((section) => {
  section.vaccines.forEach((vaccine) => {
    const existingEntry = vaccineNameMap.get(vaccine.name) || {
      vaccineName: vaccine.name,
      schedule: []
    };

    existingEntry.schedule.push({
      age: section.age,
      type: vaccine.type,
      dose: vaccine.dose
    });

    vaccineNameMap.set(vaccine.name, existingEntry);
  });
});

export const VACCINATION_SCHEDULE_DATA = Array.from(vaccineNameMap.values());

export const VACCINATION_NAME_OPTIONS = VACCINATION_SCHEDULE_DATA.map(
  (item) => item.vaccineName
);

export const getAgeOptionsForVaccination = (vaccinationName) => {
  const selectedVaccination = VACCINATION_SCHEDULE_DATA.find(
    (item) => item.vaccineName === vaccinationName
  );

  if (!selectedVaccination) {
    return [];
  }

  return [...new Set(selectedVaccination.schedule.map((dose) => dose.age))];
};

export const getVaccinationTypeOptions = (vaccinationName, ageLabel = "") => {
  const selectedVaccination = VACCINATION_SCHEDULE_DATA.find(
    (item) => item.vaccineName === vaccinationName
  );

  if (!selectedVaccination) {
    return [];
  }

  return [...new Set(
    selectedVaccination.schedule
      .filter((dose) => !ageLabel || dose.age === ageLabel)
      .map((dose) => dose.type)
  )];
};

export const getDoseOptionsForVaccination = (vaccinationName, ageLabel, vaccinationType = "") => {
  const selectedVaccination = VACCINATION_SCHEDULE_DATA.find(
    (item) => item.vaccineName === vaccinationName
  );

  if (!selectedVaccination || !ageLabel) {
    return [];
  }

  return selectedVaccination.schedule
    .filter((dose) => dose.age === ageLabel && (!vaccinationType || dose.type === vaccinationType))
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

const normalizeScheduleValue = (value) => value?.trim().toLowerCase() || "";

const DOSE_SORT_ORDER = {
  "0th": 0,
  "1st": 1,
  "2nd": 2,
  "3rd": 3,
  "Booster": 4
};

const getScheduleRowKey = (vaccinationName, vaccinationType = "") =>
  `${normalizeScheduleValue(vaccinationName)}::${normalizeScheduleValue(vaccinationType)}`;

const getScheduleDoseKey = (
  vaccinationName,
  vaccinationType = "",
  ageLabel = "",
  doseLabel = ""
) => [
  normalizeScheduleValue(vaccinationName),
  normalizeScheduleValue(vaccinationType),
  normalizeScheduleValue(ageLabel),
  normalizeScheduleValue(doseLabel)
].join("::");

const getLegacyScheduleDoseKey = (
  vaccinationName,
  ageLabel = "",
  doseLabel = ""
) => [
  normalizeScheduleValue(vaccinationName),
  normalizeScheduleValue(ageLabel),
  normalizeScheduleValue(doseLabel)
].join("::");

export const buildVaccinationScheduleRows = (records = []) => {
  const scheduleRowMap = new Map();
  const scheduledDoseMap = new Map();
  const legacyScheduledDoseMap = new Map();
  const scheduleRowKeysByName = new Map();
  const scheduleMetadataByRowKey = new Map();

  VACCINATION_SCHEDULE.forEach((section) => {
    section.vaccines.forEach((vaccine) => {
      const rowKey = getScheduleRowKey(vaccine.name, vaccine.type);
      const existingRow = scheduleRowMap.get(rowKey) || {
        name: `${vaccine.name} (${vaccine.type})`,
        vaccination_name: vaccine.name,
        vaccination_type: vaccine.type,
        doses: []
      };

      const doseEntry = {
        age: section.age,
        label: vaccine.dose,
        status: "pending",
        date: ""
      };

      existingRow.doses.push(doseEntry);

      scheduleRowMap.set(rowKey, existingRow);

      scheduledDoseMap.set(
        getScheduleDoseKey(vaccine.name, vaccine.type, section.age, vaccine.dose),
        doseEntry
      );

      const legacyDoseKey = getLegacyScheduleDoseKey(vaccine.name, section.age, vaccine.dose);
      const legacyScheduledEntries = legacyScheduledDoseMap.get(legacyDoseKey) || [];
      legacyScheduledEntries.push(doseEntry);
      legacyScheduledDoseMap.set(legacyDoseKey, legacyScheduledEntries);

      const normalizedName = normalizeScheduleValue(vaccine.name);
      const rowKeysForName = scheduleRowKeysByName.get(normalizedName) || [];
      if (!rowKeysForName.includes(rowKey)) {
        rowKeysForName.push(rowKey);
        scheduleRowKeysByName.set(normalizedName, rowKeysForName);
      }

      const rowMetadata = scheduleMetadataByRowKey.get(rowKey) || [];
      rowMetadata.push({
        age: section.age,
        label: vaccine.dose
      });
      scheduleMetadataByRowKey.set(rowKey, rowMetadata);
    });
  });

  const resolveScheduleRowKey = (record) => {
    const directRowKey = getScheduleRowKey(record.vaccination_name, record.vaccination_type || "");

    if (scheduleRowMap.has(directRowKey)) {
      return directRowKey;
    }

    const rowKeysForName = scheduleRowKeysByName.get(normalizeScheduleValue(record.vaccination_name)) || [];

    if (rowKeysForName.length === 1) {
      return rowKeysForName[0];
    }

    const exactAgeAndDoseMatches = rowKeysForName.filter((rowKey) =>
      (scheduleMetadataByRowKey.get(rowKey) || []).some((entry) =>
        normalizeScheduleValue(entry.age) === normalizeScheduleValue(record.age_label) &&
        normalizeScheduleValue(entry.label) === normalizeScheduleValue(record.dose_label)
      )
    );

    if (exactAgeAndDoseMatches.length === 1) {
      return exactAgeAndDoseMatches[0];
    }

    const doseMatches = rowKeysForName.filter((rowKey) =>
      (scheduleMetadataByRowKey.get(rowKey) || []).some((entry) =>
        normalizeScheduleValue(entry.label) === normalizeScheduleValue(record.dose_label)
      )
    );

    if (doseMatches.length === 1) {
      return doseMatches[0];
    }

    return null;
  };

  records.forEach((record) => {
    const exactScheduledDose = scheduledDoseMap.get(
      getScheduleDoseKey(
        record.vaccination_name,
        record.vaccination_type || "",
        record.age_label,
        record.dose_label
      )
    );

    if (exactScheduledDose) {
      exactScheduledDose.status = "done";
      exactScheduledDose.date = formatVaccinationDate(record.vaccination_date);
      return;
    }

    const legacyScheduledEntries = legacyScheduledDoseMap.get(
      getLegacyScheduleDoseKey(record.vaccination_name, record.age_label, record.dose_label)
    ) || [];

    if (!record.vaccination_type && legacyScheduledEntries.length === 1) {
      legacyScheduledEntries[0].status = "done";
      legacyScheduledEntries[0].date = formatVaccinationDate(record.vaccination_date);
      return;
    }

    const matchedScheduleRowKey = resolveScheduleRowKey(record);

    if (matchedScheduleRowKey) {
      const matchedScheduleRow = scheduleRowMap.get(matchedScheduleRowKey);
      const alreadyInAgeCell = matchedScheduleRow.doses.some((dose) =>
        normalizeScheduleValue(dose.age) === normalizeScheduleValue(record.age_label) &&
        normalizeScheduleValue(dose.label) === normalizeScheduleValue(record.dose_label) &&
        dose.status === "done"
      );

      if (!alreadyInAgeCell) {
        matchedScheduleRow.doses.push({
          age: record.age_label,
          label: record.dose_label,
          status: "done",
          date: formatVaccinationDate(record.vaccination_date)
        });
      }

      return;
    }

    const customRowKey = `custom::${getScheduleRowKey(record.vaccination_name, record.vaccination_type || "Custom")}`;
    const existingRow = scheduleRowMap.get(customRowKey) || {
      name: `${record.vaccination_name} (${record.vaccination_type || "Custom"})`,
      vaccination_name: record.vaccination_name,
      vaccination_type: record.vaccination_type || "Custom",
      doses: []
    };

    if (!existingRow.doses.some((dose) => dose.age === record.age_label)) {
      existingRow.doses.push({
        age: record.age_label,
        label: record.dose_label,
        status: "done",
        date: formatVaccinationDate(record.vaccination_date)
      });
    }

    scheduleRowMap.set(customRowKey, existingRow);
  });

  return Array.from(scheduleRowMap.values()).map((row) => ({
    ...row,
    doses: row.doses.sort((leftDose, rightDose) => {
      const leftSortValue = DOSE_SORT_ORDER[leftDose.label] ?? Number.MAX_SAFE_INTEGER;
      const rightSortValue = DOSE_SORT_ORDER[rightDose.label] ?? Number.MAX_SAFE_INTEGER;

      if (leftSortValue !== rightSortValue) {
        return leftSortValue - rightSortValue;
      }

      if (leftDose.status !== rightDose.status) {
        return leftDose.status === "done" ? -1 : 1;
      }

      return 0;
    })
  }));
};
