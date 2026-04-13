export const VACCINATION_SCHEDULE = [
  {
    age: "Birth",
    vaccines: [
      { name: "BCG", dose: "0th" },
      { name: "Polio", type: "OPV", dose: "0th" },
      { name: "Hepatitis B", dose: "0th" }
    ]
  },
  {
    age: "6 Weeks",
    vaccines: [
      { name: "DTP", dose: "1st" },
      { name: "Polio", type: "IPV", dose: "1st" },
      { name: "Hib", dose: "1st" },
      { name: "Hepatitis B", dose: "1st" },
      { name: "Rotavirus", dose: "1st" },
      { name: "Pneumococcal", dose: "1st" }
    ]
  },
  {
    age: "10 Weeks",
    vaccines: [
      { name: "DTP", dose: "2nd" },
      { name: "Polio", type: "IPV", dose: "2nd" },
      { name: "Hib", dose: "2nd" },
      { name: "Hepatitis B", dose: "2nd" },
      { name: "Rotavirus", dose: "2nd" },
      { name: "Pneumococcal", dose: "2nd" }
    ]
  },
  {
    age: "14 Weeks",
    vaccines: [
      { name: "DTP", dose: "3rd" },
      { name: "Polio", type: "IPV", dose: "3rd" },
      { name: "Hib", dose: "3rd" },
      { name: "Rotavirus", dose: "3rd" },
      { name: "Pneumococcal", dose: "3rd" }
    ]
  },
  {
    age: "6 Months",
    vaccines: [
      { name: "Polio", type: "OPV", dose: "Booster" },
      { name: "Influenza", dose: "1st" }
    ]
  },
  {
    age: "7 Months",
    vaccines: [
      { name: "Influenza", dose: "2nd" }
    ]
  },
  {
    age: "9 Months",
    vaccines: [
      { name: "MMR", dose: "1st" },
      { name: "Japanese Encephalitis", dose: "1st" }
    ]
  },
  {
    age: "12 Months",
    vaccines: [
      { name: "Hepatitis A", dose: "1st" }
    ]
  },
  {
    age: "15 Months",
    vaccines: [
      { name: "MMR", dose: "2nd" },
      { name: "Varicella", dose: "1st" },
      { name: "Pneumococcal", dose: "Booster" }
    ]
  },
  {
    age: "16-18 Months",
    vaccines: [
      { name: "DTP", dose: "Booster" },
      { name: "Polio", type: "IPV", dose: "Booster" },
      { name: "Hib", dose: "Booster" }
    ]
  },
  {
    age: "18 Months",
    vaccines: [
      { name: "Hepatitis A", dose: "2nd" }
    ]
  },
  {
    age: "2 Years",
    vaccines: [
      { name: "Typhoid", dose: "1st" }
    ]
  },
  {
    age: "4-6 Years",
    vaccines: [
      { name: "DTP", dose: "Booster" },
      { name: "Polio", type: "OPV", dose: "Booster" },
      { name: "MMR", dose: "3rd" },
      { name: "Varicella", dose: "2nd" }
    ]
  }
];

export const VACCINATION_HEADERS = [
  "Vaccination Details",
  ...VACCINATION_SCHEDULE.map((section) => section.age)
];

const AGE_ORDER_BY_LABEL = new Map(
  VACCINATION_SCHEDULE.map((section, index) => [section.age, index])
);

const vaccineNameMap = new Map();

VACCINATION_SCHEDULE.forEach((section) => {
  section.vaccines.forEach((vaccine) => {
    const existingEntry = vaccineNameMap.get(vaccine.name) || {
      vaccineName: vaccine.name,
      schedule: []
    };

    existingEntry.schedule.push({
      age: section.age,
      type: vaccine.type || "",
      hasExplicitType: Boolean(vaccine.type),
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

  const hasAgeSelection = AGE_ORDER_BY_LABEL.has(ageLabel);
  const selectedAgeOrder = AGE_ORDER_BY_LABEL.get(ageLabel);

  return [...new Set(
    selectedVaccination.schedule
      .filter((dose) => {
        if (!hasAgeSelection) {
          return Boolean(dose.hasExplicitType);
        }

        const doseAgeOrder = AGE_ORDER_BY_LABEL.get(dose.age);
        return (
          Boolean(dose.hasExplicitType) &&
          typeof doseAgeOrder === "number" &&
          doseAgeOrder <= selectedAgeOrder
        );
      })
      .map((dose) => dose.type)
  )];
};

export const getDoseOptionsForVaccination = (
  vaccinationName,
  ageLabel = "",
  vaccinationType = ""
) => {
  const selectedVaccination = VACCINATION_SCHEDULE_DATA.find(
    (item) => item.vaccineName === vaccinationName
  );

  if (!selectedVaccination) {
    return [];
  }

  return [...new Set(
    selectedVaccination.schedule
      .filter((dose) => (!ageLabel || dose.age === ageLabel) && (!vaccinationType || dose.type === vaccinationType))
      .map((dose) => dose.dose)
  )];
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
      const vaccinationType = vaccine.type || "";
      const rowKey = getScheduleRowKey(vaccine.name, vaccinationType);
      const existingRow = scheduleRowMap.get(rowKey) || {
        name: vaccinationType ? `${vaccine.name} (${vaccinationType})` : vaccine.name,
        vaccination_name: vaccine.name,
        vaccination_type: vaccinationType,
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
        getScheduleDoseKey(vaccine.name, vaccinationType, section.age, vaccine.dose),
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
