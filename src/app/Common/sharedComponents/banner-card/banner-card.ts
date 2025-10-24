import { Component, Input } from '@angular/core';

interface BannerButton {
  text: string;
  icon?: string;
  style?: 'primary' | 'secondary';
  action?: () => void;
}

interface BannerConfig {
  icon?: string;
  title: string;
  subtitle?: string;
  description?: string;
  meta?: { icon: string; text: string }[];
  buttons?: BannerButton[];
  bgGradient?: string;
}

@Component({
  selector: 'app-banner-card',
  standalone: false,
  templateUrl: './banner-card.html',
  styleUrl: './banner-card.scss'
})
export class BannerCard {
@Input() config!: BannerConfig;
}
