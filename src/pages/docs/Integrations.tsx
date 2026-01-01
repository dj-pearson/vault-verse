import { Card } from "@/components/ui/card";
import { TerminalWindow, TerminalLine } from "@/components/TerminalWindow";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layers, Server, Container, GitBranch, Cloud, Rocket } from "lucide-react";

export default function Integrations() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
          <Layers className="h-10 w-10 text-primary" />
          Integrations
        </h1>
        <p className="text-xl text-muted-foreground">
          Use ENVault with popular frameworks, platforms, and CI/CD pipelines
        </p>
      </div>

      {/* Framework Integrations */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Server className="h-6 w-6 text-primary" />
          Framework Integrations
        </h2>

        <Tabs defaultValue="nextjs" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="nextjs">Next.js</TabsTrigger>
            <TabsTrigger value="express">Express</TabsTrigger>
            <TabsTrigger value="vite">Vite</TabsTrigger>
            <TabsTrigger value="django">Django</TabsTrigger>
          </TabsList>

          <TabsContent value="nextjs" className="space-y-4 mt-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Next.js Integration</h3>
              <p className="text-muted-foreground mb-4">
                Use ENVault to inject environment variables into your Next.js development and build process.
              </p>
              <TerminalWindow>
                <div className="text-terminal-comment"># Development</div>
                <TerminalLine prompt>envault run npm run dev</TerminalLine>
                <div className="h-2" />
                <div className="text-terminal-comment"># Production build</div>
                <TerminalLine prompt>envault run --env production npm run build</TerminalLine>
                <div className="h-2" />
                <div className="text-terminal-comment"># Or export to .env.local</div>
                <TerminalLine prompt>envault export -o .env.local</TerminalLine>
              </TerminalWindow>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm">
                  <strong>Tip:</strong> Add <code className="bg-background px-1.5 py-0.5 rounded">.env.local</code> to
                  your <code className="bg-background px-1.5 py-0.5 rounded">.gitignore</code> to keep secrets out of version control.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="express" className="space-y-4 mt-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Express.js Integration</h3>
              <p className="text-muted-foreground mb-4">
                Run your Express server with ENVault-managed environment variables.
              </p>
              <TerminalWindow>
                <div className="text-terminal-comment"># Development with nodemon</div>
                <TerminalLine prompt>envault run nodemon src/index.js</TerminalLine>
                <div className="h-2" />
                <div className="text-terminal-comment"># Production</div>
                <TerminalLine prompt>envault run --env production node src/index.js</TerminalLine>
                <div className="h-2" />
                <div className="text-terminal-comment"># Using package.json scripts</div>
                <TerminalLine prompt>envault run npm start</TerminalLine>
              </TerminalWindow>
              <div className="mt-4 bg-terminal-bg text-terminal-text p-4 rounded-lg font-mono text-sm">
                <div className="text-terminal-comment">// Access variables in your code</div>
                <div>const dbUrl = process.env.DATABASE_URL;</div>
                <div>const apiKey = process.env.API_KEY;</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="vite" className="space-y-4 mt-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Vite Integration</h3>
              <p className="text-muted-foreground mb-4">
                Vite projects can use ENVault for both development and build processes.
              </p>
              <TerminalWindow>
                <div className="text-terminal-comment"># Export to .env for Vite</div>
                <TerminalLine prompt>envault export -o .env</TerminalLine>
                <div className="h-2" />
                <div className="text-terminal-comment"># Or run directly</div>
                <TerminalLine prompt>envault run npm run dev</TerminalLine>
                <div className="h-2" />
                <div className="text-terminal-comment"># Production build</div>
                <TerminalLine prompt>envault run --env production npm run build</TerminalLine>
              </TerminalWindow>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm">
                  <strong>Note:</strong> Remember that Vite only exposes variables prefixed with
                  <code className="bg-background px-1.5 py-0.5 rounded mx-1">VITE_</code> to the client.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="django" className="space-y-4 mt-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Django Integration</h3>
              <p className="text-muted-foreground mb-4">
                Manage Django settings with ENVault environment variables.
              </p>
              <TerminalWindow>
                <div className="text-terminal-comment"># Run Django dev server</div>
                <TerminalLine prompt>envault run python manage.py runserver</TerminalLine>
                <div className="h-2" />
                <div className="text-terminal-comment"># Run migrations</div>
                <TerminalLine prompt>envault run python manage.py migrate</TerminalLine>
                <div className="h-2" />
                <div className="text-terminal-comment"># Production with gunicorn</div>
                <TerminalLine prompt>envault run --env production gunicorn myapp.wsgi</TerminalLine>
              </TerminalWindow>
              <div className="mt-4 bg-terminal-bg text-terminal-text p-4 rounded-lg font-mono text-sm">
                <div className="text-terminal-comment"># settings.py</div>
                <div>import os</div>
                <div className="mt-2">SECRET_KEY = os.environ['SECRET_KEY']</div>
                <div>DATABASES = {'{'}'default': {'{'}'ENGINE': '...',</div>
                <div>    'NAME': os.environ['DB_NAME'],{'}}'}</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Docker Integration */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Container className="h-6 w-6 text-primary" />
          Docker Integration
        </h2>
        <p className="text-muted-foreground mb-4">
          Use ENVault with Docker for secure secret management in containerized environments.
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Development with Docker Compose</h3>
            <TerminalWindow>
              <div className="text-terminal-comment"># Export to .env for docker-compose</div>
              <TerminalLine prompt>envault export -o .env</TerminalLine>
              <TerminalLine prompt>docker-compose up</TerminalLine>
            </TerminalWindow>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Build-time Variables</h3>
            <TerminalWindow>
              <div className="text-terminal-comment"># Pass variables during build</div>
              <TerminalLine prompt>envault run docker build --build-arg API_KEY=$API_KEY .</TerminalLine>
            </TerminalWindow>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Runtime Variables</h3>
            <TerminalWindow>
              <div className="text-terminal-comment"># Pass variables at runtime</div>
              <TerminalLine prompt>envault export --format json | docker run --env-file /dev/stdin myapp</TerminalLine>
              <div className="h-2" />
              <div className="text-terminal-comment"># Or use shell expansion</div>
              <TerminalLine prompt>docker run -e DATABASE_URL=$(envault get DATABASE_URL) myapp</TerminalLine>
            </TerminalWindow>
          </div>
        </div>
      </Card>

      {/* CI/CD Integrations */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <GitBranch className="h-6 w-6 text-primary" />
          CI/CD Pipeline Integration
        </h2>

        <Tabs defaultValue="github" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="github">GitHub Actions</TabsTrigger>
            <TabsTrigger value="gitlab">GitLab CI</TabsTrigger>
            <TabsTrigger value="jenkins">Jenkins</TabsTrigger>
          </TabsList>

          <TabsContent value="github" className="space-y-4 mt-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">GitHub Actions</h3>
              <p className="text-muted-foreground mb-4">
                Use ENVault with GitHub Actions for secure CI/CD workflows.
              </p>
              <div className="bg-terminal-bg text-terminal-text p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <div className="text-terminal-comment"># .github/workflows/deploy.yml</div>
                <pre>{`name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install ENVault
        run: npm install -g envault-cli

      - name: Login to ENVault
        run: envault login --token \${{ secrets.ENVAULT_TOKEN }}

      - name: Pull secrets
        run: envault sync --pull

      - name: Build with secrets
        run: envault run --env production npm run build

      - name: Deploy
        run: envault run --env production ./deploy.sh`}</pre>
              </div>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm">
                  <strong>Setup:</strong> Add your ENVault CLI token as
                  <code className="bg-background px-1.5 py-0.5 rounded mx-1">ENVAULT_TOKEN</code> in your
                  repository's secrets.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="gitlab" className="space-y-4 mt-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">GitLab CI/CD</h3>
              <p className="text-muted-foreground mb-4">
                Integrate ENVault with your GitLab pipelines.
              </p>
              <div className="bg-terminal-bg text-terminal-text p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <div className="text-terminal-comment"># .gitlab-ci.yml</div>
                <pre>{`stages:
  - build
  - deploy

variables:
  ENVAULT_TOKEN: \$ENVAULT_TOKEN

build:
  stage: build
  before_script:
    - npm install -g envault-cli
    - envault login --token $ENVAULT_TOKEN
    - envault sync --pull
  script:
    - envault run --env production npm run build
  artifacts:
    paths:
      - dist/

deploy:
  stage: deploy
  script:
    - envault run --env production ./deploy.sh
  only:
    - main`}</pre>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="jenkins" className="space-y-4 mt-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Jenkins Pipeline</h3>
              <p className="text-muted-foreground mb-4">
                Use ENVault in your Jenkins pipelines.
              </p>
              <div className="bg-terminal-bg text-terminal-text p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <div className="text-terminal-comment">// Jenkinsfile</div>
                <pre>{`pipeline {
    agent any

    environment {
        ENVAULT_TOKEN = credentials('envault-token')
    }

    stages {
        stage('Setup') {
            steps {
                sh 'npm install -g envault-cli'
                sh 'envault login --token $ENVAULT_TOKEN'
                sh 'envault sync --pull'
            }
        }

        stage('Build') {
            steps {
                sh 'envault run --env production npm run build'
            }
        }

        stage('Deploy') {
            steps {
                sh 'envault run --env production ./deploy.sh'
            }
        }
    }
}`}</pre>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Platform Deployments */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Cloud className="h-6 w-6 text-primary" />
          Platform Deployments
        </h2>

        <Tabs defaultValue="vercel" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="vercel">Vercel</TabsTrigger>
            <TabsTrigger value="railway">Railway</TabsTrigger>
            <TabsTrigger value="fly">Fly.io</TabsTrigger>
          </TabsList>

          <TabsContent value="vercel" className="space-y-4 mt-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Vercel Deployment</h3>
              <p className="text-muted-foreground mb-4">
                Sync ENVault secrets with Vercel environment variables.
              </p>
              <TerminalWindow>
                <div className="text-terminal-comment"># Export and upload to Vercel</div>
                <TerminalLine prompt>envault export --env production --format json | \</TerminalLine>
                <TerminalLine>  jq -r 'to_entries[] | "\(.key)=\(.value)"' | \</TerminalLine>
                <TerminalLine>  xargs -I {'{{}'} vercel env add {'{}'}</TerminalLine>
              </TerminalWindow>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm">
                  <strong>Alternative:</strong> Use the ENVault web dashboard to configure automatic
                  sync with Vercel (Team plan feature).
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="railway" className="space-y-4 mt-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Railway Deployment</h3>
              <p className="text-muted-foreground mb-4">
                Use ENVault with Railway for seamless deployments.
              </p>
              <TerminalWindow>
                <div className="text-terminal-comment"># Export to Railway</div>
                <TerminalLine prompt>envault export --env production --format env | \</TerminalLine>
                <TerminalLine>  railway variables set</TerminalLine>
                <div className="h-2" />
                <div className="text-terminal-comment"># Or use in railway.json</div>
                <TerminalLine prompt>railway run envault run npm start</TerminalLine>
              </TerminalWindow>
            </div>
          </TabsContent>

          <TabsContent value="fly" className="space-y-4 mt-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Fly.io Deployment</h3>
              <p className="text-muted-foreground mb-4">
                Deploy to Fly.io with ENVault-managed secrets.
              </p>
              <TerminalWindow>
                <div className="text-terminal-comment"># Set secrets on Fly.io</div>
                <TerminalLine prompt>envault export --env production --format env | \</TerminalLine>
                <TerminalLine>  fly secrets import</TerminalLine>
                <div className="h-2" />
                <div className="text-terminal-comment"># Deploy</div>
                <TerminalLine prompt>fly deploy</TerminalLine>
              </TerminalWindow>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Best Practices */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Rocket className="h-6 w-6 text-primary" />
          Best Practices
        </h2>
        <ul className="space-y-4">
          <li className="flex gap-3">
            <span className="text-primary font-bold">1.</span>
            <div>
              <strong>Use environment-specific secrets</strong>
              <p className="text-sm text-muted-foreground mt-1">
                Separate development, staging, and production environments to avoid accidental data exposure.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-primary font-bold">2.</span>
            <div>
              <strong>Never commit .env files</strong>
              <p className="text-sm text-muted-foreground mt-1">
                Add <code className="bg-background px-1 py-0.5 rounded">.env*</code> to your .gitignore and use ENVault for secure storage.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-primary font-bold">3.</span>
            <div>
              <strong>Rotate secrets regularly</strong>
              <p className="text-sm text-muted-foreground mt-1">
                Use ENVault's audit logs to track when secrets were last updated and rotate them periodically.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-primary font-bold">4.</span>
            <div>
              <strong>Use CI/CD tokens with minimal scope</strong>
              <p className="text-sm text-muted-foreground mt-1">
                Create project-specific CLI tokens with read-only access for CI/CD pipelines.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-primary font-bold">5.</span>
            <div>
              <strong>Enable team sync for collaboration</strong>
              <p className="text-sm text-muted-foreground mt-1">
                Use encrypted team sync to share secrets securely instead of copying .env files.
              </p>
            </div>
          </li>
        </ul>
      </Card>
    </div>
  );
}
