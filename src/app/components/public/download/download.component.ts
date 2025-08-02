import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PreloadComponent } from "../preload/preload.component";
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface DownloadStep {
  id: number;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
  details?: string[];
  downloadUrl?: string;
  fileSize?: string;
  fileName?: string;
  instructions?: string[];
  launcherIcon?: string;
  warnings?: string[];
  tips?: string[];
  safeTips?: SafeHtml[];
}

@Component({
  selector: 'app-download',
  imports: [CommonModule, RouterModule, PreloadComponent],
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.css']
})
export class DownloadComponent implements OnInit, OnDestroy {
  @ViewChild('downloadContainer', { static: true }) downloadContainer!: ElementRef;

  constructor(private sanitizer: DomSanitizer) {}

  downloadSteps: DownloadStep[] = [
    {
      id: 1,
      title: 'System Requirements',
      description: 'Verify that your PC meets the minimum requirements',
      icon: 'fas fa-desktop',
      completed: false,
      details: [
        'Windows 7/8/10/11 (64-bit)',
        'Processor: Intel Core i3 or AMD equivalent',
        'RAM: 4GB minimum, 8GB recommended',
        'Graphics card: DirectX 11 compatible',
        'Disk space: 8GB free',
        'Stable Internet connection'
      ],
      tips: [
        'If your PC is very old, consider upgrading',
        'Close other programs for better performance',
        'Make sure you have updated antivirus'
      ]
    },
    {
      id: 2,
      title: 'Download Client',
      description: 'Download the RAR file of the Lineage 2 client',
      icon: 'fas fa-download',
      completed: false,
      downloadUrl: 'https://drive.google.com/file/d/1_S9uPh-92r3wzT9Rgs68itT1voq8lPHA/view?usp=sharing',
      fileSize: '9.89 GB',
      fileName: 'Lineage II Classic 3.0.rar',
      launcherIcon: 'assets/images/winrar_icon_256x256.png',
      warnings: [
        'Large file (9.89 GB) - Make sure you have a stable connection',
        'Do not interrupt the download or you will have to start over',
        'Verify you have enough disk space',
        'More download links will be enabled soon'
      ],
      tips: [
        'Download when you have a good internet connection',
        'Make sure the file downloaded completely',
        'Use a download manager for better reliability'
      ]
    },
    {
      id: 3,
      title: 'Extract Client',
      description: 'Extract the RAR file in a folder of your choice',
      icon: 'fas fa-folder-open',
      completed: false,
      launcherIcon: 'assets/images/winrar_icon_256x256.png',
      instructions: [
        'Use <a href="https://www.win-rar.com/" target="_blank" class="extractor-link">WinRAR</a>, <a href="https://7-zip.org/" target="_blank" class="extractor-link">7-Zip</a> or any extractor',
        'Extract to D:\\Games\\Terra-L2\\ or similar',
        'Make sure the folder has no spaces',
        'Keep the original folder structure'
      ],
      tips: [
        'WinRAR is recommended for best compatibility',
        'Extract to a simple path without special characters',
        'Make sure you have enough disk space'
      ]
    },
    {
      id: 4,
      title: 'Download Launcher',
      description: 'Download our custom launcher',
      icon: 'fas fa-download',
      completed: false,
      downloadUrl: 'https://terra-l2.com/downloads/launcher',
      fileSize: '112 MB',
      fileName: 'Launcher Terra installer.exe',
      launcherIcon: 'assets/images/icons/terra_icon.ico',
      warnings: [
        'Download from our official website only',
        'Do not use third-party launchers',
        'Keep the launcher updated'
      ],
      tips: [
        'The launcher is safe and virus-free',
        'It will automatically update game files',
        'Always download from official sources'
      ]
    },
    {
      id: 5,
      title: 'Install Launcher',
      description: 'Install the launcher following the instructions',
      icon: 'fas fa-rocket',
      completed: false,
      launcherIcon: 'assets/images/iconInstallerSelected.jpg',
      instructions: [
        'Run the Terra-Launcher.exe file',
        'Follow the installation wizard',
        'Choose installation directory',
        'Create desktop shortcut if prompted'
      ],
      tips: [
        'Install in a folder with no spaces',
        'Run as administrator if needed'
      ]
    },
    {
      id: 6,
      title: 'Configure Launcher',
      description: 'Configure the launcher with the client path',
      icon: 'fas fa-cog',
      completed: false,
      launcherIcon: 'assets/images/gamelauncher.jpg',
      warnings: [
        'The path must point to the folder where you extracted the client',
        'Do not select individual files, only the root folder where the client was extracted',
        'If it doesn\'t find the client, verify the path'
      ],
      instructions: [
        'Run Terra Launcher from the desktop',
        'Click the "Select folder" button to select the folder where you extracted the client',
        'Choose a folder for example: D:\\Games\\Terra-L2\\',
        'Click the "Update" button to update'
      ],
      tips: [
        'The launcher will automatically detect game files',
        'If there\'s an error, verify you chose the correct folder',
        'You can change the folder later if necessary'
      ]
    },
    {
      id: 7,
      title: 'Play!',
      description: 'You can now connect and enjoy the game',
      icon: 'fas fa-gamepad',
      completed: false,
      instructions: [
        'First, you need a Master Account to create a Game Account',
        'Create your Master Account at Register Page',
        'You\'ll receive a 6-digit verification code by email',
        'Use the verification code to complete your Game Account registration',
        'Click the "Play and Enjoy!" button in the launcher',

      ],
      tips: [
        'Make sure your account is activated',
        'Check server status before connecting',
        'Join our Discord for community support'
      ]
    }
  ];

  currentStep = 3;

  ngOnInit() {
    // Solo un listener de scroll para la animación
    window.addEventListener('scroll', () => {
      this.handleScrollAnimation();
    });

    // Aplicar SVG inicial (estado 0 - colores base)
    this.handleScrollAnimation();
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.handleScrollAnimation.bind(this));
  }



  private handleScrollAnimation() {
    const scrollTop = window.pageYOffset;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = Math.min(Math.max(scrollTop / documentHeight, 0), 1);
    
    // Generar SVG con colores basados en el scroll
    const svgBackground = this.generateAnimatedSVG(scrollProgress);
    
    // Aplicar al contenedor
    if (this.downloadContainer) {
      this.downloadContainer.nativeElement.style.backgroundImage = `url("data:image/svg+xml,${encodeURIComponent(svgBackground)}")`;
    }

    // Calcular qué capas están activas
    const animatableLayers = 7;
    const layerProgress = scrollProgress * animatableLayers;
    const activeLayers = Math.floor(layerProgress);
    const transitioningLayer = Math.floor(layerProgress) + 1;
    const transitionProgress = (layerProgress % 1) * 100;


  }

  private generateAnimatedSVG(scrollProgress: number): string {
    // Colores base (oscuros)
    const baseColors = [
      '#000000', // Fondo negro
      '#020205', // Capa 1
      '#030409', // Capa 2  
      '#05060e', // Capa 3
      '#070912', // Capa 4
      '#090b17', // Capa 5
      '#0a0d1b', // Capa 6
      '#0C0F20'  // Capa 7
    ];

    // Colores objetivo (púrpura)
    const targetColors = [
      '#000000', // Fondo (igual)
      '#000000', // Negro mate (Capa 1)
      '#000000', // Negro ceniza (Capa 2)
      '#000000', // Negro humo (Capa 3)
      '#000000', // Negro carbón (Capa 4)
      '#000000', // Negro grafito (Capa 5)
      '#000000', // Negro plomo (Capa 6)
      '#000000'  // Negro oxidado (Capa 7)
    ];
    
    // Número total de capas que pueden animarse (excluyendo el fondo)
    const animatableLayers = 7;
    
    // Calcular qué capas están activas según el progreso del scroll
    const currentColors = baseColors.map((baseColor, index) => {
      if (index === 0) return baseColor; // El fondo negro siempre igual
      
      // Calcular en qué momento debe activarse esta capa
      const layerProgress = (scrollProgress * animatableLayers);
      const layerIndex = index - 1; // Ajustar índice para las capas animables
      
      // Si el progreso del scroll es menor que el índice de la capa, usar color base
      if (layerProgress < layerIndex) {
        return baseColor;
      }
      
      // Si el progreso del scroll es mayor que el índice de la capa + 1, usar color objetivo
      if (layerProgress >= layerIndex + 1) {
        return targetColors[index];
      }
      
      // Si está en transición, interpolar
      const transitionProgress = layerProgress - layerIndex;
      return this.interpolateColor(baseColor, targetColors[index], transitionProgress);
    });

    // Generar SVG con los colores actuales
    return `
      <svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 1600 800'>
        <rect fill='${currentColors[0]}' width='1600' height='800'/>
        <g>
          <polygon fill='${currentColors[1]}' points='800 100 0 200 0 800 1600 800 1600 200'/>
          <polygon fill='${currentColors[2]}' points='800 200 0 400 0 800 1600 800 1600 400'/>
          <polygon fill='${currentColors[3]}' points='800 300 0 600 0 800 1600 800 1600 600'/>
          <polygon fill='${currentColors[4]}' points='1600 800 800 400 0 800'/>
          <polygon fill='${currentColors[5]}' points='1280 800 800 500 320 800'/>
          <polygon fill='${currentColors[6]}' points='533.3 800 1066.7 800 800 600'/>
          <polygon fill='${currentColors[7]}' points='684.1 800 914.3 800 800 700'/>
        </g>
      </svg>
    `;
  }

  private interpolateColor(color1: string, color2: string, factor: number): string {
    // Convertir hex a RGB
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');
    
    const r1 = parseInt(hex1.substr(0, 2), 16);
    const g1 = parseInt(hex1.substr(2, 2), 16);
    const b1 = parseInt(hex1.substr(4, 2), 16);
    
    const r2 = parseInt(hex2.substr(0, 2), 16);
    const g2 = parseInt(hex2.substr(2, 2), 16);
    const b2 = parseInt(hex2.substr(4, 2), 16);
    
    // Interpolar
    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);
    
    // Convertir de vuelta a hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  markStepAsCompleted(stepId: number) {
    const step = this.downloadSteps.find(s => s.id === stepId);
    if (step) {
      step.completed = true;
    }
  }

  nextStep() {
    if (this.currentStep < this.downloadSteps.length) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(stepId: number) {
    this.currentStep = stepId;
  }

  downloadFile(url: string | undefined, fileName: string | undefined) {
    if (url && fileName) {
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
    }
  }

  testScroll() {
    // Intentar hacer scroll programáticamente
    window.scrollTo(0, 100);
  }

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
