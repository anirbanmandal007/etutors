import { CommonModule } from "@angular/common";
import { Component, Input, input } from "@angular/core";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: "app-banner",
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: "./banner.component.html",
  styleUrl: "./banner.component.scss",
})
export class BannerComponent {
  faClose = faClose;
  showBanner = true;
  @Input() type!: string;
  @Input() message!: string;
}
