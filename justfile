set positional-arguments

up *args:
  docker compose --profile development up --exit-code-from api "$@"

restart *args:
  docker compose restart api "$@"

test *args:
  docker compose --profile test up --exit-code-from api-test "$@"

e2e *args:
  docker compose --profile e2e up --exit-code-from e2e "$@"

test-w *args:
  API_CMD_ARGS="--watch" just test "$@"

down:
  docker compose --profile '*' down

exec *args:
  docker compose exec -w /app/apps/api api "$@"

up-build *args:
  docker compose --profile production up --exit-code-from api-build "$@"

shell *args: (exec "bash" args)
db-generate *args: (exec "bun" "db:generate" "--name" args)
db-migrate *args: (exec "bun" "db:migrate" args)
db-drop *args: (exec "bun" "db:drop" args)
db-reset *args: (exec "bun" "db:reset" args)
db-seed: (exec "bun" "run" "./seeds/dev.ts")

db-sql:
  psql 'postgres://postgres:postgres@localhost:5432/notical-run'

api-restart:
  docker compose restart api

client *args:
  bun app dev "$@"
