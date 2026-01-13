---
layout: default
title: Home
---

<section id="about" class="pt-20 pb-12 px-4 max-w-6xl mx-auto border-b border-slate-200">
    <div class="flex flex-col md:flex-row items-center gap-12">
        <div class="flex-1 space-y-6">
            <div class="inline-block px-2 py-1 bg-surf-50 border border-surf-200 text-surf-900 text-[10px] font-mono font-bold uppercase tracking-widest">
                Mechanical Engineering Senior
            </div>
            <h1 class="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
                Designing systems for <br />
                <span class="text-surf-600 font-mono">Dynamics & Control.</span>
            </h1>
            <p class="text-lg text-slate-600 max-w-xl font-medium leading-relaxed">
                Vehicle Dynamics Lead at Stony Brook Motorsports. Specializing in mechanical design, thermal analysis, and robotic kinematics.
            </p>
            <div class="flex gap-4 pt-2">
                <a href="#projects" class="px-6 py-3 bg-slate-900 text-white text-xs font-mono font-bold hover:bg-surf-600 transition-all shadow-md no-underline">
                    VIEW PROJECTS_
                </a>
                <a href="/assets/resume.pdf" class="px-6 py-3 bg-white border border-slate-300 text-slate-700 text-xs font-mono font-bold hover:border-surf-600 hover:text-surf-600 transition-all no-underline">
                    RESUME.PDF
                </a>
            </div>
        </div>
    </div>
</section>

<section id="skills" class="py-12 bg-slate-50 border-b border-slate-200">
    <div class="max-w-6xl mx-auto px-4">
        <h2 class="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-8">Technical Proficiency</h2>
        <div class="grid md:grid-cols-3 gap-6">
            {% for skill in site.data.skills %}
            <div class="bg-white p-6 border border-slate-200 shadow-sm hover:border-surf-400 transition-colors">
                <div class="flex items-center gap-3 mb-4 text-surf-600">
                    <i data-feather="{{ skill.icon }}" class="w-5 h-5"></i>
                    <h3 class="font-mono font-bold text-sm text-slate-900 uppercase">{{ skill.category }}</h3>
                </div>
                <ul class="space-y-2 list-none p-0 m-0">
                    {% for item in skill.items %}
                    <li class="flex items-center text-slate-600 text-xs font-medium font-mono">
                        <span class="w-1 h-1 bg-surf-400 rounded-full mr-2"></span>{{ item }}
                    </li>
                    {% endfor %}
                </ul>
            </div>
            {% endfor %}
        </div>
    </div>
</section>

<section id="projects" class="py-12 px-4 max-w-6xl mx-auto">
    <div class="flex justify-between items-end mb-8">
        <h2 class="text-2xl font-bold text-slate-900">Selected Engineering Works</h2>
        <span class="text-xs font-mono text-slate-400 hidden md:inline-block">2023 — PRES</span>
    </div>

    <div class="grid md:grid-cols-2 gap-6">
        {% for project in site.data.projects %}
        <a href="{{ project.url }}" class="group block bg-white border border-slate-200 hover:border-surf-500 transition-all hover:shadow-lg hover:shadow-surf-500/10 no-underline">
            <div class="h-48 bg-slate-100 border-b border-slate-100 relative overflow-hidden group-hover:opacity-90 transition-opacity">
                <div class="absolute inset-0 flex items-center justify-center text-slate-300">
                    <i data-feather="{{ project.icon }}" class="w-12 h-12"></i>
                </div>
                <div class="absolute top-0 right-0 bg-surf-600 text-white text-[10px] font-mono font-bold px-2 py-1">
                    {{ project.category | upcase }}
                </div>
            </div>
            <div class="p-6">
                <h3 class="text-lg font-bold text-slate-900 mb-2 group-hover:text-surf-600 font-mono">{{ project.title }}</h3>
                <p class="text-slate-600 text-sm leading-relaxed mb-4">{{ project.description }}</p>
                <div class="flex flex-wrap gap-2">
                    {% for tag in project.tags %}
                    <span class="px-2 py-1 bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-mono font-bold uppercase">{{ tag }}</span>
                    {% endfor %}
                </div>
            </div>
        </a>
        {% endfor %}
    </div>
</section>