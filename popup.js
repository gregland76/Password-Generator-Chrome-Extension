const LOWERCASE_CHARACTERS = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGIT_CHARACTERS = "0123456789";
const SYMBOL_CHARACTERS = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const AMBIGUOUS_CHARACTERS = "0OIl1";
const DEFAULT_SETTINGS = {
  length: 16,
  includeLowercase: true,
  includeUppercase: true,
  includeDigits: true,
  includeSymbols: true,
  excludeAmbiguous: false
};
const STORAGE_KEY = "passwordGeneratorSettings";

const passwordOutput = document.getElementById("password-output");
const statusMessage = document.getElementById("status-message");
const strengthLabel = document.getElementById("strength-label");
const strengthFill = document.getElementById("strength-fill");
const strengthHint = document.getElementById("strength-hint");
const lengthRange = document.getElementById("length-range");
const lengthNumber = document.getElementById("length-number");
const generateButton = document.getElementById("generate-button");
const copyButton = document.getElementById("copy-button");
const optionInputs = [
  document.getElementById("include-lowercase"),
  document.getElementById("include-uppercase"),
  document.getElementById("include-digits"),
  document.getElementById("include-symbols"),
  document.getElementById("exclude-ambiguous")
];
const storageApi = typeof chrome !== "undefined" && chrome.storage ? chrome.storage.sync : null;

function clampLength(value) {
  const parsedValue = Number.parseInt(value, 10);

  if (Number.isNaN(parsedValue)) {
    return 16;
  }

  return Math.min(64, Math.max(6, parsedValue));
}

function getSelectedPools() {
  const pools = [];
  const excludeAmbiguous = optionInputs[4].checked;

  function sanitizePool(pool) {
    if (!excludeAmbiguous) {
      return pool;
    }

    return Array.from(pool)
      .filter((character) => !AMBIGUOUS_CHARACTERS.includes(character))
      .join("");
  }

  if (optionInputs[0].checked) {
    pools.push(sanitizePool(LOWERCASE_CHARACTERS));
  }

  if (optionInputs[1].checked) {
    pools.push(sanitizePool(UPPERCASE_CHARACTERS));
  }

  if (optionInputs[2].checked) {
    pools.push(sanitizePool(DIGIT_CHARACTERS));
  }

  if (optionInputs[3].checked) {
    pools.push(sanitizePool(SYMBOL_CHARACTERS));
  }

  return pools.filter((pool) => pool.length > 0);
}

function getCurrentSettings() {
  return {
    length: clampLength(lengthRange.value),
    includeLowercase: optionInputs[0].checked,
    includeUppercase: optionInputs[1].checked,
    includeDigits: optionInputs[2].checked,
    includeSymbols: optionInputs[3].checked,
    excludeAmbiguous: optionInputs[4].checked
  };
}

function applySettings(settings) {
  const nextSettings = {
    ...DEFAULT_SETTINGS,
    ...settings,
    length: clampLength(settings.length ?? DEFAULT_SETTINGS.length)
  };

  lengthRange.value = String(nextSettings.length);
  lengthNumber.value = String(nextSettings.length);
  optionInputs[0].checked = Boolean(nextSettings.includeLowercase);
  optionInputs[1].checked = Boolean(nextSettings.includeUppercase);
  optionInputs[2].checked = Boolean(nextSettings.includeDigits);
  optionInputs[3].checked = Boolean(nextSettings.includeSymbols);
  optionInputs[4].checked = Boolean(nextSettings.excludeAmbiguous);
}

function saveSettings() {
  if (!storageApi) {
    return;
  }

  storageApi.set({ [STORAGE_KEY]: getCurrentSettings() });
}

function loadSettings() {
  if (!storageApi) {
    return Promise.resolve(DEFAULT_SETTINGS);
  }

  return new Promise((resolve) => {
    storageApi.get(STORAGE_KEY, (result) => {
      resolve({
        ...DEFAULT_SETTINGS,
        ...(result[STORAGE_KEY] || {})
      });
    });
  });
}

function pickRandomCharacter(pool) {
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}

function shuffleCharacters(characters) {
  for (let index = characters.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = characters[index];
    characters[index] = characters[swapIndex];
    characters[swapIndex] = current;
  }

  return characters;
}

function updateStrengthMeter(settings) {
  const activeTypes = [
    settings.includeLowercase,
    settings.includeUppercase,
    settings.includeDigits,
    settings.includeSymbols
  ].filter(Boolean).length;
  const lengthScore = Math.min(settings.length / 20, 1) * 45;
  const varietyScore = (activeTypes / 4) * 40;
  const bonusScore = settings.length >= 14 && activeTypes >= 3 ? 15 : 0;
  const score = Math.round(lengthScore + varietyScore + bonusScore);

  let label = "Faible";
  let hint = "Ajoutez de la longueur et plusieurs familles de caractères.";
  let color = "#bc4749";

  if (score >= 80) {
    label = "Très forte";
    hint = settings.excludeAmbiguous
      ? "Bonne combinaison de longueur, de diversité et de lisibilité."
      : "Bonne combinaison de longueur et de diversité.";
    color = "#0b7a75";
  } else if (score >= 60) {
    label = "Forte";
    hint = "Le mot de passe est solide pour la plupart des usages.";
    color = "#2a9d8f";
  } else if (score >= 40) {
    label = "Moyenne";
    hint = "Ajoutez des caractères spéciaux ou augmentez la longueur.";
    color = "#d97706";
  }

  strengthLabel.textContent = label;
  strengthHint.textContent = hint;
  strengthFill.style.width = `${Math.max(score, 8)}%`;
  strengthFill.style.background = color;
}

function generatePassword() {
  const passwordLength = clampLength(lengthRange.value);
  const selectedPools = getSelectedPools();
  const settings = getCurrentSettings();

  updateStrengthMeter(settings);
  saveSettings();

  if (selectedPools.length === 0) {
    passwordOutput.textContent = "Sélectionnez au moins un type de caractère.";
    statusMessage.textContent = "";
    return;
  }

  const allCharacters = selectedPools.join("");
  const passwordCharacters = selectedPools.map((pool) => pickRandomCharacter(pool));

  while (passwordCharacters.length < passwordLength) {
    passwordCharacters.push(pickRandomCharacter(allCharacters));
  }

  passwordOutput.textContent = shuffleCharacters(passwordCharacters).join("");
  statusMessage.textContent = "";
}

function syncLengthInputs(source) {
  const nextValue = clampLength(source.value);
  lengthRange.value = String(nextValue);
  lengthNumber.value = String(nextValue);
}

async function copyPassword() {
  const password = passwordOutput.textContent;

  if (!password || password.startsWith("Sélectionnez")) {
    statusMessage.textContent = "Aucun mot de passe valide à copier.";
    return;
  }

  try {
    await navigator.clipboard.writeText(password);
    statusMessage.textContent = "Mot de passe copié.";
  } catch {
    statusMessage.textContent = "Copie impossible dans ce navigateur.";
  }
}

lengthRange.addEventListener("input", () => {
  syncLengthInputs(lengthRange);
  generatePassword();
});

lengthNumber.addEventListener("input", () => {
  syncLengthInputs(lengthNumber);
  generatePassword();
});

generateButton.addEventListener("click", generatePassword);
copyButton.addEventListener("click", copyPassword);

optionInputs.forEach((input) => {
  input.addEventListener("change", generatePassword);
});

loadSettings().then((storedSettings) => {
  applySettings(storedSettings);
  syncLengthInputs(lengthRange);
  generatePassword();
});