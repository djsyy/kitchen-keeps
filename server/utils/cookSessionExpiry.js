export const expireStaleCookSessions = async (
  database,
  userId,
  { recipeId, cookSessionId } = {}
) => {
  const values = [userId];
  let sessionFilter = '';

  if (recipeId !== undefined) {
    values.push(recipeId);
    sessionFilter = 'AND recipe_id = $2';
  }

  if (cookSessionId !== undefined) {
    values.push(cookSessionId);
    sessionFilter = 'AND id = $2';
  }

  await database.query(
    `
      UPDATE cook_sessions
      SET status = 'cancelled',
        cancelled_at = NOW(),
        cancellation_reason = 'expired',
        expired_prompt_seen_at = NULL
      WHERE user_id = $1
        ${sessionFilter}
        AND status = 'active'
        AND updated_at < NOW() - INTERVAL '7 days'
    `,
    values
  );
};
