import { defineIncoming } from '@/internal/message/incoming/segment-base';
import { XMLParser } from 'fast-xml-parser';
import { inflateSync } from 'node:zlib';
import { z } from 'zod';

const forwardXmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@',
});

const forwardXmlSchema = z.object({
    msg: z.object({
        '@m_resid': z.string(),
        '@tSum': z.string(),
        item: z.object({
            title: z.array(z.object({
                '@color': z.string(),
                '#text': z.string(),
            }))
        })
    })
});

export const forwardParser = defineIncoming(
    'richMsg',
    'forward',
    (element) => {
        if (element.serviceId === 35 && element.template1 !== undefined) {
            const xml = inflateSync(element.template1.subarray(1)).toString('utf-8');
            const parsed = forwardXmlSchema.parse(forwardXmlParser.parse(xml)).msg;
            return {
                resId: parsed['@m_resid'],
                recursiveCount: parseInt(parsed['@tSum']),
                preview: parsed.item.title
                    .filter(title => title['@color'] === '#777777')
                    .map(title => title['#text']),
            };
        }
    }
);