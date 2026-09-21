import {createShellDestinationRegistry,type ShellDestinationDescriptor} from './destination-registry.js';
const d=(id:string,area:string,en:string,ar:string,enDescription:string,arDescription:string):ShellDestinationDescriptor=>Object.freeze({id,area,labels:Object.freeze({ar,en}),description:Object.freeze({ar:arDescription,en:enDescription})});
export const CEP_PRODUCT_DESTINATIONS=Object.freeze([
 d('shell','W01','Home','الرئيسية','CEP workspace composition and navigation','تركيب مساحة CEP والتنقل العام'),
 d('today','W01','Today','اليوم','Resume work and current projections','استئناف العمل والإسقاطات الحالية'),
 d('library','W02','Library','المكتبة','Knowledge and Structured authoring','المعرفة والتحرير المنظم'),
 d('learn','W02','Learn','التعلّم','Learning and practice','التعلّم والممارسة'),
 d('rq','W02','RQ','البحث','Research analysis and comparison','تحليل البحث والمقارنة'),
 d('visualize','W02','Visualize','التصوّر','Relations and spatial views','العلاقات والمنظورات المكانية'),
 d('enterprise','W03','Enterprise','المؤسسة','Enterprise modelling studio','استوديو نمذجة المؤسسة'),
 d('labs','W03','Labs','المختبرات','Lab authoring and handoff studio','استوديو تأليف المختبرات وتسليمها'),
 d('results','W03','Results','النتائج','Result inspection and verification','فحص النتائج والتحقق منها'),
 d('runs','W03','Runs','التشغيل','Operational simulation and terminal studio','استوديو التشغيل والمحاكاة والطرفية'),
 d('scenarios','W03','Scenarios','السيناريوهات','Scenario authoring and preparation studio','استوديو تأليف السيناريوهات وإعدادها'),
 d('evidence','W04','Evidence','الأدلة','Evidence collection and admission','جمع الأدلة وقبولها'),
 d('mastery','W04','Mastery','الإتقان','Mastery explanation and evaluation projection','إسقاط تفسير الإتقان وتقييمه'),
 d('portfolio','W04','Portfolio','الملف','Portfolio curation and projection','تنسيق الملف وإسقاطه'),
 d('reviews','W04','Reviews','المراجعات','Formal review and decision workflow','سير عمل المراجعة والقرار الرسمي'),
 d('configuration','W05','Configuration','الإعداد التشغيلي','Operational configuration truth','حقيقة الإعداد التشغيلي'),
 d('manual_ai','W05','Manual AI','الذكاء الاصطناعي اليدوي','Manual provider-neutral AI bridge','جسر ذكاء اصطناعي يدوي ومحايد للمزوّد'),
 d('releases','W05','Releases','الإصدارات','Release readiness and deployment observation','جاهزية الإصدار ومراقبة النشر'),
 d('backup','W05','Backup','النسخ الاحتياطي','Backup and restore capability','النسخ الاحتياطي والاستعادة'),
 d('health','W05','Health','الصحة','Runtime health and diagnostics','صحة وقت التشغيل والتشخيص'),
 d('processing','W05','Processing','المعالجة','Local processing jobs','مهام المعالجة المحلية'),
 d('audit','W05','Audit','التدقيق','Audit traceability workbench','مساحة عمل التدقيق والتتبّع'),
 d('validation','W05','Validation','التحقق','Validation workbench','مساحة عمل التحقق')
] as const);
export const CEP_PRODUCT_DESTINATION_REGISTRY=createShellDestinationRegistry(CEP_PRODUCT_DESTINATIONS,{defaultId:'library'});
