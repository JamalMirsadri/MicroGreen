import React from 'react';
import { Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-border/50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="w-5 h-5 text-primary" />
              <span className="font-display text-lg font-semibold">Inner Garden</span>
            </div>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              Personalized microgreens for your unique body, mood, and wellness journey.
            </p>
          </div>
          {[
            { title: 'Explore', links: [{ label: 'Take the Quiz', to: '/quiz' }, { label: 'Products', to: '/recommendations' }, { label: 'Subscriptions', to: '/subscribe' }] },
            { title: 'Your Space', links: [{ label: 'My Garden', to: '/garden' }, { label: 'Rewards', to: '/rewards' }, { label: 'Share Profile', to: '/share' }] },
            { title: 'Company', links: [{ label: 'About Us', to: '/' }, { label: 'Contact', to: '/' }, { label: 'Terms', to: '/' }] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-body text-sm font-semibold text-foreground mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="font-body text-sm text-muted-foreground hover:text-primary transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-border/30 text-center">
          <p className="font-body text-xs text-muted-foreground">© 2026 Inner Garden. Nourish your nature.</p>
        </div>
      </div>
    </footer>
  );
}