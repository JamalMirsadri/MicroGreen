const PENDING_KEY = 'pendingQuizResult';
const RESULT_KEY = 'quizResult';

export function getPendingQuiz() {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setPendingQuiz(payload) {
  sessionStorage.setItem(PENDING_KEY, JSON.stringify(payload));
}

export function clearPendingQuiz() {
  sessionStorage.removeItem(PENDING_KEY);
}

export function getQuizResult() {
  try {
    const raw = sessionStorage.getItem(RESULT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setQuizResult(payload) {
  sessionStorage.setItem(RESULT_KEY, JSON.stringify(payload));
  clearPendingQuiz();
}

/** Save quiz + garden progress to the logged-in user's account */
export async function syncQuizToAccount(api, payload) {
  const { identity, mood, need, lifestyle, flavor, goal, element, energy, stress } = payload;

  await api.entities.create('QuizResult', {
    mood,
    need,
    lifestyle,
    flavor,
    goal,
    element,
    energy_level: energy,
    stress_level: stress,
    identity_name: identity?.name,
    identity_description: identity?.description,
  });

  const garden = await api.garden.get();
  const updated = await api.garden.update({
    ...garden,
    xp: (garden.xp || 0) + 25,
    badges: [...new Set([...(garden.badges || []), 'first_quiz'])],
    plants_grown: (garden.plants_grown || 0) + 1,
    identity_name: identity?.name,
  });

  setQuizResult(payload);
  sessionStorage.setItem('gardenXP', String(updated.xp));

  return { garden: updated };
}
