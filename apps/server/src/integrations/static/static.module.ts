import { Module, OnModuleInit } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { join } from 'path';
import * as fs from 'node:fs';
import fastifyStatic from '@fastify/static';
import { EnvironmentService } from '../environment/environment.service';
import { WorkspaceRepo } from '@docmost/db/repos/workspace/workspace.repo';
import { EnvironmentModule } from '../environment/environment.module';
import { DatabaseModule } from '@docmost/db/database.module';

@Module({
  imports: [EnvironmentModule, DatabaseModule],
  providers: [EnvironmentService, WorkspaceRepo],
})
export class StaticModule implements OnModuleInit {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly environmentService: EnvironmentService,
    private readonly workspaceRepo: WorkspaceRepo,
  ) {
    console.log('=== STATIC MODULE CONSTRUCTOR CALLED ===');
  }

  public async onModuleInit() {
    const httpAdapter = this.httpAdapterHost.httpAdapter;
    const app = httpAdapter.getInstance();

    const clientDistPath = join(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'client/dist',
    );

    const indexFilePath = join(clientDistPath, 'index.html');

    if (fs.existsSync(clientDistPath) && fs.existsSync(indexFilePath)) {
      const indexTemplateFilePath = join(clientDistPath, 'index-template.html');
      const windowVar = '<!--window-config-->';

      const configString = {
        ENV: this.environmentService.getNodeEnv(),
        APP_URL: this.environmentService.getAppUrl(),
        CLOUD: this.environmentService.isCloud(),
        FILE_UPLOAD_SIZE_LIMIT:
          this.environmentService.getFileUploadSizeLimit(),
        FILE_IMPORT_SIZE_LIMIT:
          this.environmentService.getFileImportSizeLimit(),
        DRAWIO_URL: this.environmentService.getDrawioUrl(),
        SUBDOMAIN_HOST: this.environmentService.isCloud()
          ? this.environmentService.getSubdomainHost()
          : undefined,
        COLLAB_URL: this.environmentService.getCollabUrl(),
        BILLING_TRIAL_DAYS: this.environmentService.isCloud()
          ? this.environmentService.getBillingTrialDays()
          : undefined,
        POSTHOG_HOST: this.environmentService.getPostHogHost(),
        POSTHOG_KEY: this.environmentService.getPostHogKey(),
      };

      const windowScriptContent = `<script>window.CONFIG=${JSON.stringify(configString)};</script>`;
      console.log(
        'Generated window.CONFIG:',
        JSON.stringify(configString, null, 2),
      );

      if (!fs.existsSync(indexTemplateFilePath)) {
        fs.copyFileSync(indexFilePath, indexTemplateFilePath);
      }

      const html = fs.readFileSync(indexTemplateFilePath, 'utf8');
      const transformedHtml = html.replace(windowVar, windowScriptContent);

      fs.writeFileSync(indexFilePath, transformedHtml);

      const RENDER_PATH = '*';

      console.log('=== STATIC MODULE INITIALIZATION ===');
      console.log('Client dist path:', clientDistPath);
      console.log('Index file path:', indexFilePath);

      // Debug: List all files in the assets directory
      const assetsPath = join(clientDistPath, 'assets');
      if (fs.existsSync(assetsPath)) {
        const assetFiles = fs.readdirSync(assetsPath);
        console.log('Assets directory contents:', assetFiles);
      } else {
        console.log('ERROR: Assets directory does not exist at:', assetsPath);
      }

      // Add a hook to log ALL requests before they're processed
      app.addHook('onRequest', async (request: any, reply: any) => {
        console.log('=== INCOMING REQUEST ===', request.method, request.url);
      });

      console.log('Registering static files...');

      // Register static file serving for assets
      await app.register(fastifyStatic, {
        root: clientDistPath,
        prefix: '/', // Serve files from root path
        wildcard: false,
        decorateReply: false, // Prevent conflicts with multiple registrations
      });

      console.log('Registering catch-all route:', RENDER_PATH);

      app.get(RENDER_PATH, async (req: any, res: any) => {
        console.log('=== ROUTE HANDLER CALLED ===');
        console.log('Request URL:', req.url);
        console.log('Request method:', req.method);

        // Skip static assets (CSS, JS, images, etc.)
        if (
          req.url.startsWith('/assets/') ||
          req.url.match(
            /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|map)$/,
          )
        ) {
          console.log(
            'Skipping static asset:',
            req.url,
            '- letting fastify-static handle it',
          );
          // Let fastify-static handle these
          return res.callNotFound();
        }

        // Handle root path redirect
        if (req.url === '/') {
          try {
            // Try to get workspace and check for default landing page
            const workspace = await this.getWorkspaceForRequest(req);
            console.log('Workspace found:', workspace?.name);
            console.log('Default landing page:', workspace?.defaultLandingPage);

            if (workspace?.defaultLandingPage) {
              console.log('Redirecting to:', workspace.defaultLandingPage);
              // Use relative path redirect
              return res.redirect(302, workspace.defaultLandingPage);
            }
          } catch (err) {
            console.error('Error getting workspace:', err);
          }

          // No default landing page set - serve the normal SPA (which will handle routing)
          console.log('No default landing page set, serving normal SPA');
          const stream = fs.createReadStream(indexFilePath);
          return res.type('text/html').send(stream);
        }

        // For all other routes, serve the SPA
        console.log('Serving SPA for route:', req.url);

        // Debug: Check if index.html exists and log its size
        if (fs.existsSync(indexFilePath)) {
          const stats = fs.statSync(indexFilePath);
          console.log('Index file exists, size:', stats.size, 'bytes');

          // Log first 500 characters of the HTML to see if it's valid
          const htmlContent = fs.readFileSync(indexFilePath, 'utf8');
          console.log(
            'HTML preview (first 500 chars):',
            htmlContent.substring(0, 500),
          );
        } else {
          console.log('ERROR: Index file does not exist at:', indexFilePath);
        }

        const stream = fs.createReadStream(indexFilePath);
        res.type('text/html').send(stream);
      });
    }
  }

  private async getWorkspaceForRequest(req: any) {
    if (this.environmentService.isSelfHosted()) {
      return await this.workspaceRepo.findFirst();
    } else if (this.environmentService.isCloud()) {
      const header = req.headers.host;
      const subdomain = header.split('.')[0];
      return await this.workspaceRepo.findByHostname(subdomain);
    }
    return null;
  }
}
