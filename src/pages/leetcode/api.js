import { API_URL } from './constants';

const authHeader = (token) => (token && token !== 'null' && token !== 'undefined' ? { Authorization: `Bearer ${token}` } : {});

export async function fetchProblem(problemId, token) {
  const res = await fetch(`${API_URL}/problems/${problemId}`, {
    headers: { ...authHeader(token) }
  });
  if (!res.ok) throw new Error('Failed to fetch problem');
  return res.json();
}

export async function fetchMetadata(problemId, token) {
  if (!token) return null;
  const res = await fetch(`${API_URL}/problem-metadata/${problemId}/user-preferences`, {
    headers: { ...authHeader(token) }
  });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchFullMetadata(problemId, token) {
  const res = await fetch(`${API_URL}/problem-metadata/${problemId}`, {
    headers: { ...authHeader(token) }
  });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchSubmissions(problemId, token) {
  if (!token) return [];
  const res = await fetch(`${API_URL}/submissions?problemId=${problemId}&limit=20`, {
    headers: { ...authHeader(token) }
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.submissions || [];
}

export async function fetchSubmissionById(id, token) {
  const res = await fetch(`${API_URL}/submissions/${id}`, {
    headers: { ...authHeader(token) }
  });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchDiscussions(problemId, token) {
  const res = await fetch(`${API_URL}/discussions/problem/${problemId}`, {
    headers: { ...authHeader(token) }
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.discussions || [];
}

export async function fetchHints(problemId, token) {
  const res = await fetch(`${API_URL}/judge/hints/${problemId}`, {
    headers: { ...authHeader(token) }
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.hints || [];
}

export async function fetchDraft(problemId, token) {
  if (!token) return null;
  const res = await fetch(`${API_URL}/drafts/${problemId}`, {
    headers: { ...authHeader(token) }
  });
  if (!res.ok) return null;
  return res.json();
}

export async function saveDraft(problemId, code, language, token) {
  if (!token) return;
  await fetch(`${API_URL}/drafts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify({ problemId, code, language })
  });
}

// Run a single test case
export async function runCode(code, language, problemId, testCaseIndex, token) {
  const res = await fetch(`${API_URL}/judge/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify({ code, language, problemId, testCaseIndex })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Run failed');
  }
  return res.json();
}

// Run ALL visible test cases at once (batch)
export async function runCodeBatch(code, language, problemId, token, customCases = []) {
  const res = await fetch(`${API_URL}/judge/run-batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify({ code, language, problemId, customCases })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Batch run failed');
  }
  return res.json();
}

// Run with custom input (user-edited test case)
export async function runCodeCustom(code, language, input, token) {
  const res = await fetch(`${API_URL}/judge/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify({ code, language, input })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Run failed');
  }
  return res.json();
}

export async function submitCode(code, language, problemId, token) {
  const res = await fetch(`${API_URL}/judge/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify({ code, language, problemId })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Submit failed');
  }
  return res.json();
}

export async function toggleLike(problemId, token) {
  if (!token) throw new Error('Please sign in to like this problem');
  const res = await fetch(`${API_URL}/problem-metadata/${problemId}/like`, {
    method: 'POST', headers: { ...authHeader(token) }
  });
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

export async function toggleDislike(problemId, token) {
  if (!token) throw new Error('Please sign in to rate this problem');
  const res = await fetch(`${API_URL}/problem-metadata/${problemId}/dislike`, {
    method: 'POST', headers: { ...authHeader(token) }
  });
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

export async function toggleBookmark(problemId, token) {
  if (!token) throw new Error('Please sign in to bookmark problems');
  const res = await fetch(`${API_URL}/problem-metadata/${problemId}/bookmark`, {
    method: 'POST', headers: { ...authHeader(token) }
  });
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

export async function fetchEditorial(problemId, token) {
  const res = await fetch(`${API_URL}/explanations/problem/${problemId}/solution`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify({ userCode: '// request solution' })
  });
  if (!res.ok) return null;
  return res.json();
}

export async function createDiscussion(problemId, title, content, tags, token) {
  if (!token) throw new Error('Please sign in to post discussions');
  const res = await fetch(`${API_URL}/discussions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify({ problemId, title, content, tags })
  });
  if (!res.ok) throw new Error('Failed to post');
  return res.json();
}

export async function createComment(discussionId, content, token) {
  if (!token) throw new Error('Please sign in to comment');
  const res = await fetch(`${API_URL}/discussions/${discussionId}/comment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify({ content })
  });
  if (!res.ok) throw new Error('Failed to comment');
  return res.json();
}
